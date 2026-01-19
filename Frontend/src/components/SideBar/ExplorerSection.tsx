import React, { useEffect, useState } from 'react';
import { fetchTables, deleteTable } from '../../services/api';
import { FaTable, FaTrash } from 'react-icons/fa';

interface ExplorerSectionProps {
    onOpenTable: (tableName: string) => void;
    onTableDeleted: (tableName: string) => void;
}

export const ExplorerSection: React.FC<ExplorerSectionProps> = ({ onOpenTable, onTableDeleted }) => {
    const [tables, setTables] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);

    const loadTables = async () => {
        setLoading(true);
        try {
            const data = await fetchTables();
            setTables(data);
            setSelectedTable(null); // Clear selection on refresh
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTables();
    }, []);

    const handleDelete = async () => {
        if (!selectedTable) return;
        if (!confirm(`Czy na pewno chcesz usunąć tabelę "${selectedTable}"?`)) return;

        try {
            await deleteTable(selectedTable);
            onTableDeleted(selectedTable);
            await loadTables();
        } catch (err: any) {
            console.error("Failed to delete table:", err);
            alert(`Nie udało się usunąć tabeli: ${err.message || String(err)}`);
        }
    };

    return (
        <div className="explorer-section">
            <div className="explorer-header" style={{ padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Dostępne zbiory</span>
                <div>
                    <button title="Import New File" onClick={() => onOpenTable && onOpenTable("__IMPORT__")} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#61dafb', marginRight: 5 }}>+</button>
                    <button
                        title="Usuń zaznaczony"
                        onClick={() => {
                            if (!selectedTable) {
                                alert("Wybierz tabelę z listy, aby ją usunąć.");
                                return;
                            }
                            handleDelete();
                        }}
                        style={{
                            cursor: 'pointer',
                            background: 'transparent',
                            border: 'none',
                            color: selectedTable ? '#ff6b6b' : '#666',
                            marginRight: 5,
                            opacity: selectedTable ? 1 : 0.5
                        }}
                    >
                        <FaTrash />
                    </button>
                    <button title="Refresh" onClick={loadTables} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#ccc' }}>↻</button>
                </div>
            </div>
            {loading ? (
                <div style={{ padding: 10 }}>Ładowanie...</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {Array.isArray(tables) && tables.map(table => (
                        <li
                            key={table}
                            onClick={() => setSelectedTable(table)}
                            onDoubleClick={() => onOpenTable(table)}
                            style={{
                                padding: '8px 15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #333',
                                justifyContent: 'space-between',
                                backgroundColor: selectedTable === table ? '#37373d' : 'transparent'
                            }}
                            className="explorer-item"
                        >
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FaTable style={{ marginRight: 10, color: '#61dafb' }} />
                                {table}
                            </div>
                        </li>
                    ))}
                    {(!Array.isArray(tables) || tables.length === 0) && (
                        <li style={{ padding: 15, color: '#888' }}>Brak tabel. Zaimportuj dane przez API.</li>
                    )}
                </ul>
            )}
        </div>
    );
};
