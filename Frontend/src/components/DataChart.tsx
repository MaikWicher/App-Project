
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
}

export const DataChart: React.FC<DataChartProps> = ({ tableName, chartType = 'line' }) => {
    const [data, setData] = useState<any[]>([]);
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
                const transformedData = result.rows.map((row) => {
                    const obj: any = {};
                    result.columns.forEach((col, index) => {
                        obj[col] = row[index];
                    });
                    return obj;
                });

                setData(transformedData);
                setColumns(result.columns);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [tableName]);

    if (loading) return <div>Loading data for {tableName}...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data.length) return <div>No data found in {tableName}</div>;

    // Simple heuristic: use first column as X axis, rest as data lines/bars
    const xAxisKey = columns[0];
    const dataKeys = columns.slice(1);

    return (
        <div style={{ width: '100%', height: 400 }}>
            <h3>Data from table: {tableName}</h3>
            <ResponsiveContainer>
                {chartType === 'line' ? (
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {dataKeys.map((key, index) => (
                            <Line
                                key={key}
                                type="monotone"
                                dataKey={key}
                                stroke={`hsl(${index * 60}, 70%, 50%)`}
                            />
                        ))}
                    </LineChart>
                ) : (
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey={xAxisKey} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {dataKeys.map((key, index) => (
                            <Bar
                                key={key}
                                dataKey={key}
                                fill={`hsl(${index * 60}, 70%, 50%)`}
                            />
                        ))}
                    </BarChart>
                )}
            </ResponsiveContainer>
        </div>
    );
};
