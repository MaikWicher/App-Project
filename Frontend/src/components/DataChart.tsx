
import React, { useEffect, useState } from 'react';
import { fetchTableData } from '../services/api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts';

interface DataChartProps {
    tableName: string;
    chartType?: 'line' | 'bar';
    xColumn?: string;
    yColumns?: string[];
    onColumnsLoaded?: (columns: string[]) => void;
}

export const DataChart: React.FC<DataChartProps> = ({ tableName, chartType = 'line', xColumn, yColumns, onColumnsLoaded }) => {
    const [data, setData] = useState<Record<string, any>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const result = await fetchTableData(tableName);

                // Transform DuckDB row/column format to Recharts object array format
                // Assuming result.rows is array of arrays and result.columns is array of column names
                // Transform DuckDB row/column format to Recharts object array format
                const columnNames = result.columns.map(c => c.name);

                const transformedData = result.rows.map((row) => {
                    const obj: Record<string, any> = {};
                    result.columns.forEach((col, index) => {
                        let val = row[index];

                        if (typeof val === 'string' && val.trim() !== '') {
                            // Normalize Polish delimiters: replace , with .
                            const normalized = val.replace(',', '.');
                            // Check if it's a valid number now
                            if (!isNaN(Number(normalized))) {
                                val = parseFloat(normalized);
                            }
                        }
                        obj[col.name] = val;
                    });
                    return obj;
                });

                setData(transformedData);
                setColumns(columnNames);
                if (onColumnsLoaded) {
                    onColumnsLoaded(columnNames);
                }
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError(String(err));
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [tableName]);

    if (loading) return <div>Loading data for {tableName}...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data.length) return <div>No data found in {tableName}</div>;

    // Use provided props or heuristic (first column X, rest data)
    const xAxisKey = xColumn || columns[0];
    const dataKeys = (yColumns && yColumns.length > 0) ? yColumns : columns.slice(1);

    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Data from table: {tableName}</h3>

            <div style={{ flex: 1, minHeight: 300 }}>
                <ResponsiveContainer>
                    {chartType === 'line' ? (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey={xAxisKey} stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444' }}
                            />
                            <Legend />
                            {dataKeys.map((key, index) => (
                                <Line
                                    key={key}
                                    type="monotone"
                                    dataKey={key}
                                    stroke={`hsl(${index * 60}, 70%, 60%)`}
                                    dot={false}
                                    strokeWidth={2}
                                />
                            ))}
                        </LineChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                            <XAxis dataKey={xAxisKey} stroke="#ccc" />
                            <YAxis stroke="#ccc" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#2d2d2d', border: '1px solid #444' }}
                            />
                            <Legend />
                            {dataKeys.map((key, index) => (
                                <Bar
                                    key={key}
                                    dataKey={key}
                                    fill={`hsl(${index * 60}, 70%, 60%)`}
                                />
                            ))}
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Data Preview / Debug Section */}
            <div style={{ height: 200, overflow: 'auto', marginTop: 20, borderTop: '1px solid #333', padding: 10, background: '#1e1e1e' }}>
                <h4 style={{ marginTop: 0 }}>Data Preview (First 50 rows)</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', color: '#ccc' }}>
                    <thead>
                        <tr>
                            {columns.map(c => (
                                <th key={c} style={{ textAlign: 'left', borderBottom: '1px solid #444', padding: 4 }}>{c}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.slice(0, 50).map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #333' }}>
                                {columns.map(c => (
                                    <td key={c} style={{ padding: 4 }}>{String(row[c])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
