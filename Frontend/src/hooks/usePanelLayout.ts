import type { PanelLayoutConfig } from "../types/PanelLayoutConfig";
import { useState } from "react";



export const usePanelLayout = (initial?: Partial<PanelLayoutConfig>) => {
  const [layout, setLayout] = useState<PanelLayoutConfig>({
    mainPanelRatio: 60,
    bottomPanelRatio: 40,
    sidebarWidth: 300,
    sidebarCollapsed: false,
    sidebarPinned: true,
    maximizedPanel: 'none',
    mainPanelTabs: [],
    bottomPanelTabs: [],
    activeMainTab: '',
    activeBottomTab: '',
    ...initial
  });

  const setMainPanelRatio = (ratio: number) =>
    setLayout(prev => ({ ...prev, mainPanelRatio: ratio, bottomPanelRatio: 100 - ratio }));

  const toggleSidebarCollapsed = () =>
    setLayout(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));

  const toggleSidebarPinned = () =>
    setLayout(prev => ({ ...prev, sidebarPinned: !prev.sidebarPinned }));

  const maximizePanel = (panel: 'none' | 'main' | 'bottom') =>
    setLayout(prev => ({ ...prev, maximizedPanel: panel }));

  const setActiveTab = (panel: 'main' | 'bottom', tabId: string) =>
    setLayout(prev => ({
      ...prev,
      ...(panel === 'main' ? { activeMainTab: tabId } : { activeBottomTab: tabId })
    }));

  return {
    layout,
    setLayout,
    setMainPanelRatio,
    toggleSidebarCollapsed,
    toggleSidebarPinned,
    maximizePanel,
    setActiveTab
  };
};
