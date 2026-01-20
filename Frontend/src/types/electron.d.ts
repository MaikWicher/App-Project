export { };

declare global {
    interface Window {
        electron: {
            version: string;
            saveConfig: (data: any) => Promise<{ success: boolean; error?: string }>;
            loadConfig: () => Promise<any>;
        };
    }
}
