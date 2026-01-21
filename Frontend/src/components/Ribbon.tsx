import React, { useState } from "react";
import {
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
    makeStyles,
    shorthands,
} from "@fluentui/react-components";
import {
    ArrowDownloadRegular,
} from "@fluentui/react-icons";
import type { VisualizationTab } from "../types/visualization";
import { fetchTableData } from "../services/api";

const useStyles = makeStyles({
    container: {
        ...shorthands.padding("8px", "16px"),
        backgroundColor: "#292929", // Slightly lighter than background
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
    },
});

interface RibbonProps {
    activeTab: VisualizationTab | null;
}

import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from 'react-i18next';

// ... (previous imports)

export const Ribbon: React.FC<RibbonProps> = ({ activeTab }) => {
    const styles = useStyles();
    const { t } = useTranslation('common');
    const [exporting, setExporting] = useState(false);

    const canExport = activeTab && ["duckdb", "chart", "graph"].includes(activeTab.type);

    const handleExport = async () => {
        if (!activeTab || !canExport) return;
        setExporting(true);

        try {
            if (activeTab.type === "duckdb") {
                await exportTable(activeTab);
            } else if (activeTab.type === "chart") {
                await exportChart(activeTab);
            } else if (activeTab.type === "graph") {
                await exportGraph(activeTab);
            }
        } catch (e) {
            console.error(e);
            alert(t('error'));
        } finally {
            setExporting(false);
        }
    };

    // ... (rest of export logic, unchanged)

    const downloadCsv = (filename: string, content: string) => {
        // ...
        const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportTable = async (tab: VisualizationTab) => {
        const tableName = (tab.content as any)?.tableName;
        if (!tableName) return;

        // Fetch all data (limit 100000 for export?)
        const data = await fetchTableData(tableName, 100000);

        if (!data.rows || data.rows.length === 0) {
            alert("No data to export");
            return;
        }

        // Generate CSV
        const headers = data.columns.map(c => c.name).join(",");
        const rows = data.rows.map(row =>
            row.map((cell: any) => {
                if (cell === null || cell === undefined) return "";
                const str = String(cell);
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            }).join(",")
        ).join("\n");

        downloadCsv(`${tableName}_export.csv`, `${headers}\n${rows}`);
    };

    const exportChart = async (tab: VisualizationTab) => {
        const content = tab.content as any; // ChartConfig
        if (!content || !content.categories || !content.series) {
            alert("Chart has no data");
            return;
        }

        const categories = content.categories as string[];
        const series = content.series as Array<{ name: string; data: number[] }>;

        // Header: Category, Series1, Series2...
        const header = ["Category", ...series.map(s => s.name)].join(",");

        // Rows
        const rows = categories.map((cat, index) => {
            const rowData = [cat];
            series.forEach(s => {
                rowData.push(String(s.data[index] ?? ""));
            });
            return rowData.join(",");
        }).join("\n");

        downloadCsv(`${tab.title}_chart_export.csv`, `${header}\n${rows}`);
    };

    const exportGraph = async (tab: VisualizationTab) => {
        const content = tab.content as any; // GraphConfig
        if (!content || !content.nodes) {
            alert("Graph has no data");
            return;
        }

        const nodes = content.nodes as Array<{ data: any }>;
        const edges = (content.edges || []) as Array<{ data: any }>;

        const csvLines = ["Type,ID,Label,Source,Target,Value"];

        nodes.forEach(n => {
            const d = n.data;
            csvLines.push(`Node,${d.id},"${d.label || ""}",,,${d.value || ""}`);
        });

        edges.forEach(e => {
            const d = e.data;
            csvLines.push(`Edge,${d.id || ""},"${d.label || ""}",${d.source},${d.target},${d.value || ""}`);
        });

        downloadCsv(`${tab.title}_graph_export.csv`, csvLines.join("\n"));
    };

    return (
        <div className={styles.container}>
            <Toolbar>
                <ToolbarButton
                    appearance="subtle"
                    icon={<ArrowDownloadRegular />}
                    disabled={!canExport || exporting}
                    onClick={handleExport}
                >
                    {exporting ? t('loading') : t('actions.export')}
                </ToolbarButton>
                <ToolbarDivider />
            </Toolbar>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ color: '#888', fontSize: '12px' }}>
                    {activeTab ? `Active: ${activeTab.title}` : "No active tab"}
                </div>
                <LanguageSelector />
            </div>
        </div>
    );
};
