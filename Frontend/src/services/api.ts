
const API_BASE_URL = '/api'; // Using Vite proxy

export interface TableData {
    columns: string[];
    rows: any[][];
    totalRows: number;
}

export const fetchTables = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/data/tables`);
    if (!response.ok) {
        throw new Error('Failed to fetch tables');
    }
    return response.json();
};

export const fetchTableData = async (tableName: string, limit: number = 1000, offset: number = 0): Promise<TableData> => {
    const response = await fetch(`${API_BASE_URL}/data/${tableName}?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for table ${tableName}`);
    }
    return response.json();
};
