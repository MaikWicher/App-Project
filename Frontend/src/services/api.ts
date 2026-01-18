
const API_BASE_URL = '/api'; // Using Vite proxy

export interface TableData {
    columns: { name: string; type: string }[];
    rows: any[][];
    totalRows: number;
}

// Helper type matching backend ApiEnvelope
interface ApiEnvelope<T> {
    ok: boolean;
    data?: T;
    error?: any;
}

export const fetchTables = async (): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/data/tables`);
    if (!response.ok) {
        throw new Error('Failed to fetch tables');
    }
    const json = await response.json() as ApiEnvelope<string[]>;
    return json.data ?? [];
};

export const fetchTableData = async (tableName: string, limit: number = 1000, offset: number = 0): Promise<TableData> => {
    const response = await fetch(`${API_BASE_URL}/data/table/${tableName}?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch data for table ${tableName}`);
    }
    const json = await response.json() as ApiEnvelope<TableData>;
    if (!json.data) throw new Error("No data received");
    return json.data;
};
