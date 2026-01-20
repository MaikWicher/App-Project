import React, { useState } from 'react';
import { GroupTreeVisualization } from './GroupTreeVisualization';

interface FilterCondition {
    id: string;
    column: string;
    operator: string;
    value: string;
}

interface Props {
    data: Record<string, any>[];
    columns: string[];
    onEdit: (rowIndex: number, colName: string, value: any) => void;
    onSort?: (colName: string) => void;
    selectedColumn?: string | null;
    onSelectColumn?: (colName: string) => void;
    grouping?: { groupByColumn: string; groupedColumns: string[] };
    filters?: FilterCondition[];
}

export const TableDataView: React.FC<Props> = ({ data, columns, onEdit, onSort, selectedColumn, onSelectColumn, grouping, filters }) => {
    const [editCell, setEditCell] = useState<{ r: number, c: string } | null>(null);
    const [editValue, setEditValue] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState(true);
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
    const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');

    // Filter Data
    const filteredData = React.useMemo(() => {
        let res = data;
        if (filters && filters.length > 0) {
            res = res.filter(row => {
                return filters.every(f => {
                    const val = row[f.column];
                    const filterVal = f.value;

                    if (f.operator === 'contains') {
                        return String(val ?? "").toLowerCase().includes(filterVal.toLowerCase());
                    }
                    if (f.operator === 'starts') {
                        return String(val ?? "").toLowerCase().startsWith(filterVal.toLowerCase());
                    }
                    if (f.operator === 'ends') {
                        return String(val ?? "").toLowerCase().endsWith(filterVal.toLowerCase());
                    }

                    // Numeric / Equality checks
                    if (f.operator === 'eq') return String(val) == String(filterVal);
                    if (f.operator === 'neq') return String(val) != String(filterVal);

                    const numVal = parseFloat(String(val).replace(',', '.'));
                    const numFilter = parseFloat(String(filterVal).replace(',', '.'));

                    if (isNaN(numVal) || isNaN(numFilter)) return false; // Fail gracefuly for numeric ops

                    if (f.operator === 'gt') return numVal > numFilter;
                    if (f.operator === 'lt') return numVal < numFilter;
                    if (f.operator === 'gte') return numVal >= numFilter;
                    if (f.operator === 'lte') return numVal <= numFilter;

                    return true;
                });
            });
        }
        return res;
    }, [data, filters]);

    // Expand all groups by default when grouping changes
    React.useEffect(() => {
        if (grouping?.groupByColumn) {
            const groups = new Set<string>();
            filteredData.forEach(row => {
                const key = String(row[grouping.groupByColumn] ?? "(Brak)");
                groups.add(key);
            });
            setExpandedGroups(groups);
        }
    }, [grouping?.groupByColumn, filteredData]); // Updated dependency

    const startEdit = (r: number, c: string, val: any) => {
        setEditCell({ r, c });
        setEditValue(String(val));
    };

    const commitEdit = () => {
        if (editCell) {
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
        if (e.key === 'Enter') commitEdit();
        else if (e.key === 'Escape') setEditCell(null);
    };

    const visibleColumns = React.useMemo(() => {
        if (!grouping || isExpanded) return columns;
        const hiddenCols = grouping.groupedColumns || [];
        return columns.filter(c => !hiddenCols.includes(c));
    }, [columns, grouping, isExpanded]);

    const groupedData = React.useMemo(() => {
        if (!grouping?.groupByColumn) return null;
        const groups = new Map<string, typeof filteredData>();
        filteredData.forEach(row => {
            const key = String(row[grouping.groupByColumn] ?? "(Brak)");
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key)!.push(row);
        });
        return groups;
    }, [filteredData, grouping?.groupByColumn]);

    const toggleGroup = (groupKey: string) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupKey)) next.delete(groupKey);
            else next.add(groupKey);
            return next;
        });
    };

    const getAggregation = (rows: any[], col: string) => {
        // Simple heuristic: if all values are numeric, sum them
        let sum = 0;
        let isNumeric = true;
        let count = 0;

        for (const row of rows) {
            const val = row[col];
            if (val === null || val === undefined || val === "") continue;
            const num = parseFloat(String(val));
            if (isNaN(num)) {
                isNumeric = false;
                break;
            }
            sum += num;
            count++;
        }

        if (isNumeric && count > 0) return sum.toLocaleString(); // Format nicely
        return ""; // Return empty string for non-numeric columns
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#ccc' }}>
            {grouping?.groupByColumn && (
                <div style={{ padding: '8px', borderBottom: '1px solid #333', display: 'flex', gap: '8px', alignItems: 'center', background: '#252526' }}>
                    <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#aaa' }}>Widok:</span>
                    <button
                        onClick={() => setViewMode('table')}
                        style={{
                            background: viewMode === 'table' ? '#007acc' : '#333',
                            color: '#fff', border: 'none', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: 2
                        }}
                    >
                        Tabela
                    </button>
                    <button
                        onClick={() => setViewMode('tree')}
                        style={{
                            background: viewMode === 'tree' ? '#007acc' : '#333',
                            color: '#fff', border: 'none', padding: '4px 8px', fontSize: '12px', cursor: 'pointer', borderRadius: 2
                        }}
                    >
                        Drzewo
                    </button>
                </div>
            )}

            <div style={{ flex: 1, overflow: 'hidden' }}>
                {viewMode === 'tree' && groupedData ? (
                    <GroupTreeVisualization groupedData={groupedData} groupByColumn={grouping?.groupByColumn || ""} />
                ) : (
                    <div style={{ height: '100%', overflow: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                            <thead style={{ position: 'sticky', top: 0, background: '#252526', zIndex: 1 }}>
                                <tr>
                                    <th style={{ border: '1px solid #333', padding: '4px', textAlign: 'left', width: '40px' }}>#</th>
                                    {visibleColumns.map(c => {
                                        const isSelected = selectedColumn === c;
                                        const isMainGroup = grouping?.groupByColumn === c;
                                        return (
                                            <th
                                                key={c}
                                                style={{
                                                    border: '1px solid #333',
                                                    padding: '4px',
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    background: isSelected ? '#37373d' : 'inherit',
                                                    borderBottom: isSelected ? '2px solid #007acc' : '1px solid #333'
                                                }}
                                                onClick={() => {
                                                    if (onSelectColumn) onSelectColumn(c);
                                                    if (onSort) onSort(c);
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <div style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        {isMainGroup ? (
                                                            <button
                                                                style={{
                                                                    background: 'none', border: '1px solid #555', color: '#fff',
                                                                    cursor: 'pointer', fontSize: 10, padding: 0, width: 16, height: 16, borderRadius: 2,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setIsExpanded(!isExpanded);
                                                                }}
                                                            >
                                                                {isExpanded ? '-' : '+'}
                                                            </button>
                                                        ) : null}
                                                    </div>
                                                    {c}
                                                </div>
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {groupedData ? (
                                    Array.from(groupedData.entries()).map(([groupKey, rows]) => {
                                        const isGroupExpanded = expandedGroups.has(groupKey);
                                        return (
                                            <React.Fragment key={groupKey}>
                                                <tr style={{ background: '#2d2d30', fontWeight: 'bold' }}>
                                                    <td style={{ border: '1px solid #333', padding: '4px', textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleGroup(groupKey)}>
                                                        {isGroupExpanded ? '▼' : '►'}
                                                    </td>
                                                    {visibleColumns.map(c => {
                                                        const isGroupingCol = c === grouping?.groupByColumn;
                                                        return (
                                                            <td key={c} style={{ border: '1px solid #333', padding: '4px', color: '#fff' }}>
                                                                {isGroupingCol ? (
                                                                    <span>{groupKey} ({rows.length})</span>
                                                                ) : (
                                                                    <span style={{ color: '#aaa', fontSize: '0.9em' }}>{getAggregation(rows, c)}</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                                {isGroupExpanded && rows.map((row) => {
                                                    const rIdx = data.indexOf(row);
                                                    return (
                                                        <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#1e1e1e' : '#222' }}>
                                                            <td style={{ border: '1px solid #333', padding: '4px', color: '#666' }}>{rIdx + 1}</td>
                                                            {visibleColumns.map(c => {
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
                                                    );
                                                })}
                                            </React.Fragment>
                                        );
                                    })
                                ) : (
                                    filteredData.map((row) => {
                                        const rIdx = data.indexOf(row);
                                        return (
                                            <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#1e1e1e' : '#222' }}>
                                                <td style={{ border: '1px solid #333', padding: '4px', color: '#666' }}>{rIdx + 1}</td>
                                                {visibleColumns.map(c => {
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
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
