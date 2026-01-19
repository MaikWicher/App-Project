import React, { useState } from 'react';

interface Props {
    data: Record<string, any>[];
    columns: string[];
    onEdit: (rowIndex: number, colName: string, value: any) => void;
}

export const TableDataView: React.FC<Props> = ({ data, columns, onEdit }) => {
    const [editCell, setEditCell] = useState<{ r: number, c: string } | null>(null);
    const [editValue, setEditValue] = useState<string>("");

    const startEdit = (r: number, c: string, val: any) => {
        setEditCell({ r, c });
        setEditValue(String(val));
    };

    const commitEdit = () => {
        if (editCell) {
            // Try to parse number if it looks like one
            let val: any = editValue;
            const num = parseFloat(editValue.replace(',', '.'));
            if (!isNaN(num) && editValue.trim() !== "") {
                val = num;
            }

            onEdit(editCell.r, editCell.c, val);
            setEditCell(null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            commitEdit();
        } else if (e.key === 'Escape') {
            setEditCell(null);
        }
    };

    return (
        <div style={{ height: '100%', overflow: 'auto', background: '#1e1e1e', color: '#ccc' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#252526', zIndex: 1 }}>
                    <tr>
                        <th style={{ border: '1px solid #333', padding: '4px', textAlign: 'left', width: '40px' }}>#</th>
                        {columns.map(c => (
                            <th key={c} style={{ border: '1px solid #333', padding: '4px', textAlign: 'left' }}>{c}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rIdx) => (
                        <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#1e1e1e' : '#222' }}>
                            <td style={{ border: '1px solid #333', padding: '4px', color: '#666' }}>{rIdx + 1}</td>
                            {columns.map(c => {
                                const isEditing = editCell?.r === rIdx && editCell?.c === c;
                                return (
                                    <td
                                        key={c}
                                        style={{ border: '1px solid #333', padding: '4px', cursor: 'pointer' }}
                                        onDoubleClick={() => startEdit(rIdx, c, row[c])}
                                    >
                                        {isEditing ? (
                                            <input
                                                autoFocus
                                                value={editValue}
                                                onChange={e => setEditValue(e.target.value)}
                                                onBlur={commitEdit}
                                                onKeyDown={handleKeyDown}
                                                style={{ width: '100%', background: '#000', color: '#fff', border: 'none', outline: '1px solid #007acc' }}
                                            />
                                        ) : (
                                            String(row[c] ?? "")
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
