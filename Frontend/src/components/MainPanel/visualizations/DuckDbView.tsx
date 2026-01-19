import React, { useState, useEffect, useMemo } from 'react';
import { fetchTableData } from '../../../services/api';
import type { DuckDBConfig, VisualizationTab, ChartConfig } from "../../../types/visualization";

// Visualization Components
import { LineChartView } from './LineChartView';
import { BarChartView } from './BarChartView';
import { ColumnChartView } from './ColumnChartView';
import { PieChartView } from './PieChartView';
import { StarChartView } from './StarChartView';
import { StatChartView } from './StatChartView';
import { CandlestickChartView } from './CandlestickChartView';
import { TableDataView } from './TableDataView';

interface DuckDbViewProps {
    tab: VisualizationTab;
    onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const DuckDbView: React.FC<DuckDbViewProps> = ({ tab, onUpdate }) => {
    // Read table name directly from tab content
    const config = tab.content as DuckDBConfig;
    const tableName = config?.tableName;

    // Use tab.chartType
    const chartType = tab.chartType || 'line';

    // Data State (Fetched)
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Config from Tab Content
    const xColumn = config?.xColumn;
    const yColumns = config?.yColumns || [];

    // Load Data
    useEffect(() => {
        if (!tableName) return;
        const load = async () => {
            setLoading(true);
            try {
                const result = await fetchTableData(tableName);

                const colNames = result.columns.map(c => c.name);
                const transformed = result.rows.map(row => {
                    const obj: any = {};
                    result.columns.forEach((col, idx) => {
                        let val = row[idx];
                        if (typeof val === 'string') {
                            const num = parseFloat(val.replace(',', '.'));
                            if (!isNaN(num)) val = num;
                        }
                        obj[col.name] = val;
                    });
                    return obj;
                });

                setData(transformed);

                // Update available columns in tab content if not set or if columns changed
                const currentCols = config?.columns || [];
                if (currentCols.length === 0 || currentCols.length !== colNames.length || !currentCols.every((val, idx) => val === colNames[idx])) {
                    onUpdate(tab.id, {
                        content: {
                            ...config,
                            columns: colNames,
                            // Set defaults if empty
                            xColumn: config?.xColumn || colNames[0],
                            yColumns: config?.yColumns?.length ? config.yColumns : (colNames.length > 1 ? [colNames[1]] : [])
                        }
                    });
                }

            } catch (err: any) {
                setError(err.message || String(err));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [tableName, tab.id, config, onUpdate]); // Added config and onUpdate to dependencies

    // Generate ChartConfig
    const chartConfig: ChartConfig | null = useMemo(() => {
        if (!data.length || !xColumn || yColumns.length === 0) return null;

        const categories = data.map(d => String(d[xColumn]));
        // If series exists in config (from aggregation), use it combined, 
        // OR just regenerate from columns. 
        // For simplicity, let's regenerate basic series from columns, 
        // BUT if there are extra series in config.series (added by aggregation), we should keep them?
        // Actually, AggregationTools operates on config.series. 
        // So we should Initialize config.series from data ONLY IF it's empty, 
        // then let AggregationTools modify it? 
        // NO, DuckDb is live data. Aggregation should probably be transient or re-calculated.

        // Strategy: 
        // 1. Generate base series from selected columns.
        // 2. Add any "extra" series found in config.series that are NOT in yColumns?
        // For now, let's just generate standard series.

        return {
            showLegend: config.showLegend ?? true,
            sortByValue: config.sortByValue ?? false,
            categories: categories,
            series: yColumns.map(yCol => ({
                name: yCol,
                data: data.map(d => {
                    const val = d[yCol];
                    return typeof val === 'number' ? val : 0;
                })
            }))
        };
    }, [data, xColumn, yColumns, config.showLegend, config.sortByValue]);

    // Sync generated config back to tab.content so RightPanel tools can see it
    useEffect(() => {
        if (chartConfig) {
            const content = tab.content as DuckDBConfig;

            // Serialize to detect content changes (safe for strings/numbers)
            // This prevents infinite loops but ensures updates when data changes
            const currentCats = JSON.stringify(content.categories || []);
            const newCats = JSON.stringify(chartConfig.categories);

            const currentSeries = JSON.stringify(content.series || []);
            const newSeries = JSON.stringify(chartConfig.series);

            const isShowLegendDiff = content.showLegend !== chartConfig.showLegend;
            const isSortDiff = content.sortByValue !== chartConfig.sortByValue;

            if (currentCats !== newCats || currentSeries !== newSeries || isShowLegendDiff || isSortDiff) {
                onUpdate(tab.id, {
                    content: {
                        ...content,
                        series: chartConfig.series,
                        categories: chartConfig.categories,
                        showLegend: chartConfig.showLegend,
                        sortByValue: chartConfig.sortByValue
                    }
                });
            }
        }
    }, [chartConfig, tab.id, onUpdate]);

    // Track previous axes to detect changes and avoid syncing stale content
    const prevAxesRef = React.useRef<{ x: string | undefined; y: string[] }>({ x: xColumn, y: yColumns });

    // Reverse Sync: Config -> Data (When user edits in Right Panel)
    useEffect(() => {
        // Update refs but capture PREVIOUS state for logic
        const prevAxes = prevAxesRef.current;
        const axesChanged = prevAxes.x !== xColumn ||
            prevAxes.y.length !== yColumns.length ||
            !prevAxes.y.every((col, i) => col === yColumns[i]);

        prevAxesRef.current = { x: xColumn, y: yColumns };

        if (!data.length || !xColumn || yColumns.length === 0) return;

        // CRITICAL GUARD: If axes changed, the current 'content' (categories/series) 
        // is likely STALE (belongs to old axes). Do NOT sync it to data.
        // Let Forward Sync run first to update content.
        if (axesChanged) return;

        const content = tab.content as DuckDBConfig;

        // Safety checks for arrays
        if (!Array.isArray(content.categories) || !Array.isArray(content.series)) return;

        try {
            // Check if config diffs from DATA (not chartConfig, but actual data state)
            // We construct a "theoretical" state from Data and compare with Config

            let dataChanged = false;
            let newData = [...data];

            // 1. Check Categories (X-Axis values)
            // If config categories length != data length, user added/removed rows
            if (content.categories.length !== newData.length) {
                // Adjust data rows
                if (content.categories.length > newData.length) {
                    // Add rows
                    const diff = content.categories.length - newData.length;
                    for (let i = 0; i < diff; i++) {
                        const newRow: any = {};
                        // Fill with defaults
                        if (config?.columns) config.columns.forEach(c => newRow[c] = 0);
                        // Set X
                        newRow[xColumn] = content.categories[newData.length + i];
                        newData.push(newRow);
                    }
                    dataChanged = true;
                } else {
                    // Remove rows
                    newData = newData.slice(0, content.categories.length);
                    dataChanged = true;
                }
            }

            // 2. Check Values (X-Axis Labels)
            content.categories.forEach((cat, idx) => {
                // Safe check for row existence
                if (newData[idx] && String(newData[idx][xColumn]) !== cat) {
                    newData[idx] = { ...newData[idx], [xColumn]: cat };
                    dataChanged = true;
                }
            });

            // 3. Check Series Values (Y-Axis) + Handle New Series
            const extraSeriesCount = content.series.length - yColumns.length;
            let columnsAdded = false;
            let newYColumns = [...yColumns];
            let newColumnsList = [...(config?.columns || [])];

            if (extraSeriesCount > 0) {
                // User added series via "Add Series" button
                for (let i = yColumns.length; i < content.series.length; i++) {
                    const s = content.series[i];
                    const colName = s.name; // Use series name as column name

                    // Add column to Y-Columns if not present
                    if (!newYColumns.includes(colName)) {
                        newYColumns.push(colName);
                        columnsAdded = true;
                    }
                    if (!newColumnsList.includes(colName)) {
                        newColumnsList.push(colName);
                    }

                    // Backfill data with series values
                    if (Array.isArray(s.data)) {
                        s.data.forEach((val, rIdx) => {
                            if (newData[rIdx]) {
                                newData[rIdx] = { ...newData[rIdx], [colName]: val };
                                dataChanged = true;
                            }
                        });
                    }
                }
            }

            // Sync existing mapped series
            content.series.forEach((s, sIdx) => {
                if (sIdx >= yColumns.length) return; // Skip new ones, handled above

                // Check s.data exists
                if (!s.data || !Array.isArray(s.data)) return;

                // Find matching column. 
                const targetCol = yColumns[sIdx];

                if (targetCol) {
                    s.data.forEach((val, rIdx) => {
                        // Safe check for data row
                        if (newData[rIdx]) {
                            const currentVal = newData[rIdx][targetCol];
                            // Safe check for number
                            const logicVal = typeof currentVal === 'number' ? currentVal : 0;

                            // Safe check for val being NaN
                            const safeNewVal = (typeof val === 'number' && isNaN(val)) ? 0 : val;

                            if (logicVal !== safeNewVal) {
                                newData[rIdx] = { ...newData[rIdx], [targetCol]: safeNewVal };
                                dataChanged = true;
                            }
                        }
                    });
                }
            });

            if (columnsAdded) {
                // If we added columns, we MUST update config immediately to map them
                // This will trigger another render, which is fine
                onUpdate(tab.id, {
                    content: {
                        ...content,
                        yColumns: newYColumns,
                        columns: newColumnsList
                    }
                });
                // We also update data so the values are there for the next render
                setData(newData);
                return; // Stop here, let next render handle the stable state
            }

            if (dataChanged) {
                setData(newData);
            }
        } catch (e) {
            console.error("DuckDbView Reverse Sync Error:", e);
            // Non-fatal, just stop syncing this cycle
        }

    }, [tab.content, xColumn, yColumns]); // React to tab.content changes caused by RightPanel

    // Synthetic Tab for Child Components
    const syntheticTab: VisualizationTab = useMemo(() => {
        // Fallback or Merge Logic:
        // 1. Use chartConfig (live data derived) as the BASE for critical data (categories, series from columns)
        // 2. Overlay config (persisted state) for user overrides (showLegend, sortByValue)
        // 3. For series: If config.series has Aggregations (length > chartConfig.series), try to use it? 
        //    But if X changed, config.series is invalid.
        //    Safety: If config.xColumn != current xColumn of chartConfig (implied), prefer chartConfig?
        //    We can't easily check xColumn of chartConfig here as it's just data.

        // SIMPLEST STABLE FIX:
        // Use chartConfig as the source of truth for "Data".
        // Use config as the source of truth for "Settings".

        // If chartConfig is present, it is AUTHORITATIVE for the current X/Y selection.
        if (chartConfig) {
            return {
                ...tab,
                content: {
                    ...chartConfig,
                    // Restore settings if they are compatible
                    showLegend: config.showLegend ?? chartConfig.showLegend,
                    sortByValue: config.sortByValue ?? chartConfig.sortByValue,

                    // What if user RENAMED a series? config.series has the name.
                    // chartConfig.series has the auto-generated name.
                    // We can try to merge if lengths match.
                    series: (config?.series?.length === chartConfig.series.length)
                        ? chartConfig.series.map((s, i) => ({
                            ...s,
                            name: config.series?.[i]?.name || s.name, // Keep custom name
                            data: s.data // ALWAYS use fresh data
                        }))
                        : chartConfig.series,

                    categories: chartConfig.categories // ALWAYS use fresh categories
                } as any
            };
        }

        // Fallback if chartConfig not ready (loading)
        return {
            ...tab,
            content: config as any
        };
    }, [tab, config, chartConfig]);

    if (!tableName) return <div style={{ padding: 20 }}>Wybierz tabelę.</div>;
    if (loading) return <div style={{ padding: 20 }}>Ładowanie danych...</div>;
    if (error) return <div style={{ padding: 20 }}>Błąd: {error}</div>;

    const handleEdit = (r: number, col: string, val: any) => {
        setData(prev => {
            const newData = [...prev];
            newData[r] = { ...newData[r], [col]: val };
            return newData;
        });
    };

    const renderViz = () => {
        if (chartType === 'table') {
            const cols = config?.columns || (data.length > 0 ? Object.keys(data[0]) : []);
            return <TableDataView data={data} columns={cols} onEdit={handleEdit} />;
        }

        if (!chartConfig) return <div style={{ padding: 20 }}>Skonfiguruj osie w panelu po prawej stronie.</div>;

        switch (chartType) {
            case 'line': return <LineChartView tab={syntheticTab} />;
            case 'bar': return <BarChartView tab={syntheticTab} />;
            case 'column': return <ColumnChartView tab={syntheticTab} />;
            case 'pie': return <PieChartView tab={syntheticTab} />;
            case 'star': return <StarChartView tab={syntheticTab} />;
            case 'stat': return <StatChartView tab={syntheticTab} />;
            case 'candlestick': return <CandlestickChartView tab={syntheticTab} />;
            default: return <div>Typ wykresu nieobsługiwany: {chartType}</div>;
        }
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, minHeight: 0, padding: 10 }}>
                {(() => {
                    try {
                        return renderViz();
                    } catch (e: any) {
                        return <div>Błąd renderowania wykresu: {e.message}</div>;
                    }
                })()}
            </div>
        </div>
    );
};
