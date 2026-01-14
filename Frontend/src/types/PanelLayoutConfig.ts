interface TabState {
  id: string;
  title: string;
  type: string;
  isDirty: boolean;
  isClosable: boolean;
}

export interface PanelLayoutConfig {
  mainPanelRatio: number;      
  bottomPanelRatio: number;    
  sidebarWidth: number;        
  sidebarCollapsed: boolean;   
  sidebarPinned: boolean;      
  maximizedPanel: 'none' | 'main' | 'bottom';
  mainPanelTabs: TabState[];
  bottomPanelTabs: TabState[];
  activeMainTab: string;
  activeBottomTab: string;
}
