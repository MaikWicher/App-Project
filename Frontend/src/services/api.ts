
// If we are in Electron (file protocol), use the absolute local URL.
// Otherwise (dev/prod web), use the relative path which Vite proxies.
const isFileProtocol = window.location.protocol === 'file:';
const API_BASE_URL = isFileProtocol ? 'http://127.0.0.1:5038' : '/api';

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

export const deleteTable = async (tableName: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/data/table/${tableName}`, {
        method: 'DELETE'
    });
    if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Failed to delete table ${tableName} (Status: ${response.status} ${response.statusText})`;
        try {
            const errorJson = JSON.parse(errorText);
            if (errorJson && errorJson.error) {
                errorMessage = typeof errorJson.error === 'string' ? errorJson.error : (errorJson.error.message || JSON.stringify(errorJson.error));
            }
        } catch (e) {
            // Not JSON
            if (errorText) errorMessage += `: ${errorText}`;
        }
        throw new Error(errorMessage);
    }
};

export interface UploadResponse {
    tableName: string;
    importedAs: string;
}

export const uploadFile = async (file: File, tableName: string): Promise<UploadResponse> => {
    const form = new FormData();
    form.append("file", file);
    form.append("tableName", tableName);

    const response = await fetch(`${API_BASE_URL}/import/file`, {
        method: "POST",
        body: form
    });

    if (!response.ok) {
        const json = await response.json() as ApiEnvelope<any>;
        throw new Error(json.error?.message ?? "Error importing file");
    }

    const json = await response.json() as ApiEnvelope<UploadResponse>;
    if (!json.data) throw new Error("No data received");
    return json.data;
};
