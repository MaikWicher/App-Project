
import React, { useEffect, useState } from 'react';
import { fetchTables } from '../../services/api';
import { FaTable } from 'react-icons/fa';

interface ExplorerSectionProps {
    onOpenTable: (tableName: string) => void;
}

export const ExplorerSection: React.FC<ExplorerSectionProps> = ({ onOpenTable }) => {
    const [tables, setTables] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const loadTables = async () => {
        setLoading(true);
        try {
            const data = await fetchTables();
            setTables(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTables();
    }, []);

    return (
        <div className="explorer-section">
            <div className="explorer-header" style={{ padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Dostępne zbiory</span>
                <div>
                    <button title="Import New File" onClick={() => onOpenTable && onOpenTable("__IMPORT__")} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#61dafb', marginRight: 5 }}>+</button>
                    <button title="Refresh" onClick={loadTables} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#ccc' }}>↻</button>
                </div>
            </div>
            {loading ? (
                <div style={{ padding: 10 }}>Ładowanie...</div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {tables.map(table => (
                        <li
                            key={table}
                            onClick={() => onOpenTable(table)}
                            style={{
                                padding: '8px 15px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                borderBottom: '1px solid #333'
                            }}
                            className="explorer-item"
                        >
                            <FaTable style={{ marginRight: 10, color: '#61dafb' }} />
                            {table}
                        </li>
                    ))}
                    {tables.length === 0 && (
                        <li style={{ padding: 15, color: '#888' }}>Brak tabel. Zaimportuj dane przez API.</li>
                    )}
                </ul>
            )}
        </div>
    );
};
