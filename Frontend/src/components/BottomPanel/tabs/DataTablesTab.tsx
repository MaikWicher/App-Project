import React, { useState, useEffect } from "react";
import type { DataTab } from "../../../types/dataTabs";
import { TableDataView } from "../../MainPanel/visualizations/TableDataView";
import { fetchTableData } from "../../../services/api";

interface Props {
    tab: DataTab;
    onUpdate: (id: string, changes: Partial<DataTab>) => void;
}

export const DataTablesTab: React.FC<Props> = ({ tab, onUpdate }) => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    // State for local usage if needed

    // Placeholder for table selection - in real app this might come from tab.content or a selector
    const tableName = tab.content?.tableName || "MOCK_TABLE";

    useEffect(() => {
        // Mock loading or real fetching if tableName exists
        if (tableName === "MOCK_TABLE") {
            const cols = ["ID", "Nazwa", "Wartość", "Status"];
            setColumns(cols);

            // Sync columns to tab state if missing
            if (!tab.content?.columns || tab.content.columns.length === 0) {
                onUpdate(tab.id, { content: { ...tab.content, columns: cols, defaultColumns: cols } });
            } else if (!tab.content?.defaultColumns) {
                onUpdate(tab.id, { content: { ...tab.content, defaultColumns: cols } });
            }

            setData([
                { ID: 1, Nazwa: "Produkt A", Wartość: 100, Status: "Dostępny" },
                { ID: 2, Nazwa: "Produkt B", Wartość: 200, Status: "Brak" },
                { ID: 3, Nazwa: "Produkt C", Wartość: 150, Status: "Dostępny" },
            ]);
        } else {
            const load = async () => {
                setLoading(true);
                try {
                    const res = await fetchTableData(tableName);
                    const cols = res.columns.map(c => c.name);
                    setColumns(cols);

                    // Sync columns to tab state
                    const updates: any = {};
                    if (JSON.stringify(tab.content?.columns) !== JSON.stringify(cols)) {
                        updates.columns = cols;
                    }
                    if (!tab.content?.defaultColumns) {
                        updates.defaultColumns = cols;
                    }

                    if (Object.keys(updates).length > 0) {
                        onUpdate(tab.id, { content: { ...tab.content, ...updates } });
                    }

                    setData(res.rows.map(row => {
                        const obj: any = {};
                        res.columns.forEach((c, i) => obj[c.name] = row[i]);
                        return obj;
                    }));
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            };
            load();
        }
    }, [tableName]); // Careful: onUpdate changes 'tab', but we depend on 'tableName' (primitive) or check appropriately

    const filteredData = React.useMemo(() => {
        let res = [...data];

        // Advanced Search Logic (Global)
        const { terms } = tab.search || { terms: [] };

        if (terms && terms.length > 0) {
            res = res.filter(row => {
                const values = Object.values(row);
                return terms.every(term => {
                    if (!term) return true;
                    // AND logic: active terms must be present in at least ONE column (standard global search)
                    // Wait, standard global search usually means: Row contains "A" AND Row contains "B".
                    // Each "term" is looking for "any column contains term".

                    // For performance/simplicity, using string includes:
                    const needle = term.toLowerCase();
                    return values.some(val => String(val).toLowerCase().includes(needle));
                });
            });
        }

        // Column specific search (multi-criteria)
        const searchCols = tab.search?.columns || {};
        Object.entries(searchCols).forEach(([col, val]) => {
            if (!val) return;
            const needle = (val as string).toLowerCase();

            res = res.filter(row => {
                const cellVal = String(row[col] ?? "").toLowerCase();
                return cellVal.includes(needle);
            });
        });



        // Sorting Logic
        const sortCols = tab.sorting?.columns || [];
        if (sortCols.length > 0) {
            res.sort((a, b) => {
                for (const sort of sortCols) {
                    if (sort.direction === 'none') continue;

                    let valA = a[sort.column];
                    let valB = b[sort.column];

                    if (sort.direction === 'calculated') {
                        const numA = parseFloat(String(valA));
                        const numB = parseFloat(String(valB));
                        if (!isNaN(numA) && !isNaN(numB)) {
                            valA = numA;
                            valB = numB;
                        }
                        // 'calculated' defaults to ascending numeric sort
                        if (valA < valB) return -1;
                        if (valA > valB) return 1;
                    } else {
                        // Standard Asc/Desc
                        if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
                        if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
                    }
                }
                return 0;
            });
        }

        return res;
    }, [data, tab.search, tab.sorting]);

    const handleColumnSelect = (col: string) => {
        onUpdate(tab.id, { content: { ...tab.content, selectedColumn: col } });
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Search/Filter moved to RightPanel */}

            <div style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                    <div>Ładowanie...</div>
                ) : (
                    <TableDataView
                        data={filteredData}
                        columns={tab.content?.columns || columns}
                        onEdit={() => { }}
                        selectedColumn={tab.content?.selectedColumn}
                        onSelectColumn={handleColumnSelect}
                        grouping={tab.grouping}
                        filters={tab.filters as any}
                    />
                )}
            </div>
        </div>
    );
};
