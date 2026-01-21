export interface PanelSyncConfig {
    syncMode: 'none' | 'selection' | 'filter' | 'full';
    linkedTabs: Array<{ mainTabId: string; bottomTabId: string }>;
}
