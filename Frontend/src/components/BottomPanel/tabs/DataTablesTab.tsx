import React, { useState, useEffect } from "react";
import type { DataTab } from "../../../types/dataTabs";
import { TableDataView } from "../../MainPanel/visualizations/TableDataView";
import { fetchTableData } from "../../../services/api";

interface Props {
    tab: DataTab;
}

export const DataTablesTab: React.FC<Props> = ({ tab }) => {
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Placeholder for table selection - in real app this might come from tab.content or a selector
    const tableName = tab.content?.tableName || "MOCK_TABLE";

    useEffect(() => {
        // Mock loading or real fetching if tableName exists
        if (tableName === "MOCK_TABLE") {
            setColumns(["ID", "Nazwa", "Wartość", "Status"]);
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
                    setColumns(res.columns.map(c => c.name));
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
    }, [tableName]);

    const filteredData = data.filter(row =>
        Object.values(row).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 0', display: 'flex', gap: 10, borderBottom: '1px solid #444', marginBottom: 10 }}>
                <input
                    type="text"
                    placeholder="Szukaj..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ padding: '4px 8px', background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 4 }}
                />
                <button style={{ padding: '4px 8px', cursor: 'pointer', background: '#444', color: '#fff', border: 'none', borderRadius: 4 }}>
                    Filtruj
                </button>
                <button style={{ padding: '4px 8px', cursor: 'pointer', background: '#444', color: '#fff', border: 'none', borderRadius: 4 }}>
                    Sortuj
                </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                {loading ? (
                    <div>Ładowanie...</div>
                ) : (
                    <TableDataView data={filteredData} columns={columns} onEdit={() => { }} />
                )}
            </div>
        </div>
    );
};
