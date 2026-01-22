import React, { useState, useRef, useEffect } from "react";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { Ribbon } from "./components/Ribbon";
import { SideBar } from "./components/SideBar/SideBar";
import { MainPanel } from "./components/MainPanel/MainPanel";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import { StatusBar } from "./components/StatusBar";
import { Splitter } from "./components/Splitter";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { useVisualizationTabs } from "./hooks/useVisualizationTabs";
import { useAppStatus } from "./contexts/AppStatusContext";
import { useDataTabs } from "./hooks/useDataTabs";
import "./styles.css";

interface MaximizationState {
  isMaximized: boolean;
  maximizedPanel: 'main' | 'bottom';
  previousMainHeight: number;
}

export const App: React.FC = () => {
  const [mainHeight, setMainHeight] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);
  const [activeContext, setActiveContext] = useState<'main' | 'bottom'>('main');

  const [maximizationState, setMaximizationState] = useState<MaximizationState>({
    isMaximized: false,
    maximizedPanel: 'main', // default, doesn't matter if isMaximized is false
    previousMainHeight: 60
  });

  const [syncConfig, setSyncConfig] = useState<import("./types/sync").PanelSyncConfig>({
    syncMode: 'full', // Default
    linkedTabs: []
  });

  const { tabs, activeTabId, updateTab, addTab, closeTab, activateTab, pinTab, reorderTabs } = useVisualizationTabs();
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  // Hoisted BottomPanel state
  const dataTabs = useDataTabs();
  const activeDataTab = dataTabs.tabs.find(t => t.id === dataTabs.activeTabId) ?? null;

  const { setStatus, setProgress, setLoading } = useAppStatus();

  // Maximization Logic
  const toggleMaximize = (panel: 'main' | 'bottom') => {
    setMaximizationState(prev => {
      // If already maximized with THIS panel, restore
      if (prev.isMaximized && prev.maximizedPanel === panel) {
        return {
          ...prev,
          isMaximized: false
        };
      }
      // If maximized with OTHER panel, switch to THIS panel (maximize this one)
      // OR if not maximized at all, maximize THIS one
      return {
        isMaximized: true,
        maximizedPanel: panel,
        previousMainHeight: prev.isMaximized ? prev.previousMainHeight : mainHeight
      };
    });
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey) {
        if (e.key === 'M' || e.key === 'm') {
          toggleMaximize('main');
        } else if (e.key === 'B' || e.key === 'b') {
          toggleMaximize('bottom');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mainHeight]); // Dependency on "mainHeight" technically needed for closure if we used it inside setMaximizationState purely, but we used functional update or saved it before. Actually 'previousMainHeight' needs current 'mainHeight' when maximizing.

  // Advanced Synchronization Logic based on PanelSyncConfig
  useEffect(() => {
    // 1. Auto-Link Tabs (Maintenance)
    // Find pairs based on tableName
    const newLinks: Array<{ mainTabId: string; bottomTabId: string }> = [];

    tabs.forEach(vTab => {
      const tableName = (vTab.content as any)?.tableName;
      if (tableName) {
        // Find matching data tab
        const dTab = dataTabs.tabs.find(d => (d.content as any)?.tableName === tableName);
        if (dTab) {
          newLinks.push({ mainTabId: vTab.id, bottomTabId: dTab.id });
        }
      }
    });

    // Update config if links changed (deep check simplified)
    const linksChanged = JSON.stringify(newLinks) !== JSON.stringify(syncConfig.linkedTabs);

    if (linksChanged) {
      setSyncConfig(prev => ({ ...prev, linkedTabs: newLinks }));
    }

    // 2. Perform Sync based on Mode
    if (syncConfig.syncMode === 'none') return;
    if (!activeTabId) return;

    // Find link for active main tab
    const link = newLinks.find(l => l.mainTabId === activeTabId); // Use newLinks directly to avoid one-cycle lag

    if (link) {
      if (link.bottomTabId !== dataTabs.activeTabId) {
        // 'selection' and 'full' implies switching tabs
        if (syncConfig.syncMode === 'selection' || syncConfig.syncMode === 'full') {
          dataTabs.activateTab(link.bottomTabId);
        }
      }
    } else {
      // No link found. Check if we SHOULD have one (missing data tab)
      const activeVizTab = tabs.find(t => t.id === activeTabId);
      const tableName = (activeVizTab?.content as any)?.tableName;

      if (tableName) {
        // Check if we need to create it (double check it doesn't really exist to avoid race conditions/dupes)
        const exists = dataTabs.tabs.some(d => (d.content as any)?.tableName === tableName);
        if (!exists) {
          // Auto-create missing data tab
          dataTabs.addTab("table", tableName, { tableName });
        }
      }
    }

  }, [activeTabId, tabs, dataTabs.tabs, dataTabs.activeTabId, syncConfig.syncMode]);

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      setStatus("status.initializing");

      // Restore Layout
      if (window.electron?.loadConfig) {
        try {
          const saved = await window.electron.loadConfig();
          if (saved?.layout) {
            if (typeof saved.layout.mainHeight === 'number') setMainHeight(saved.layout.mainHeight);
            if (typeof saved.layout.sideBarPinned === 'boolean') setPinned(saved.layout.sideBarPinned);
          }
        } catch (e) {
          console.error("Failed to load layout", e);
        }
      }

      setProgress(0);

      // Phase 1: Connection
      await new Promise(r => setTimeout(r, 600));
      setStatus("status.connecting");
      setProgress(30);

      // Phase 2: Loading Tables (Simulated or Real)
      await new Promise(r => setTimeout(r, 800));
      setStatus("status.loadingTables");
      setProgress(70);

      // Phase 3: Finalizing
      await new Promise(r => setTimeout(r, 400));
      setStatus("status.finalizing");
      setProgress(90);

      await new Promise(r => setTimeout(r, 200));
      setProgress(100);
      setStatus("status.ready");
      setLoading(false);
    };

    initializeApp();
  }, []); // Run once on mount

  // Save layout on change
  useEffect(() => {
    if (window.electron?.saveConfig) {
      const timeout = setTimeout(() => {
        window.electron.saveConfig({
          layout: {
            mainHeight,
            sideBarPinned: pinned
          }
        });
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [mainHeight, pinned]);

  const handleResize = (deltaPx: number) => {
    if (maximizationState.isMaximized) return; // Disable resize when maximized
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.clientHeight;
    const deltaPercent = (deltaPx / totalHeight) * 100;
    setMainHeight(h => Math.min(80, Math.max(20, h + deltaPercent)));
  };

  const handleTableDeleted = (tableName: string) => {
    // ... (keep handleTableDeleted)
    const tabToDelete = tabs.find(t => t.type === "duckdb" && (t.content as any)?.tableName === tableName);
    if (tabToDelete) {
      closeTab(tabToDelete.id);
    }
  };

  return (
    <FluentProvider theme={webDarkTheme} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="app-root" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Ribbon activeTab={activeTab} />

        <div className="workspace" ref={containerRef} style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          <SideBar
            pinned={pinned}
            onTogglePinned={() => setPinned(prev => !prev)}
            onOpenTable={(tableName) => {
              if (tableName === "__IMPORT__") {
                addTab("import");
              } else {
                addTab("duckdb", undefined, { tableName });

                // Open/Activate in BottomPanel as well
                const existingDataTab = dataTabs.tabs.find(t => (t.content as any)?.tableName === tableName);
                if (existingDataTab) {
                  dataTabs.activateTab(existingDataTab.id);
                } else {
                  dataTabs.addTab("table", tableName, { tableName });
                }
              }
            }}
            onTableDeleted={handleTableDeleted}
          />

          {/* CENTRALNA CZĘŚĆ + RIGHT PANEL */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* MAIN + BOTTOM */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>

              {/* Main Panel Area */}
              <div
                style={{
                  height: maximizationState.isMaximized
                    ? (maximizationState.maximizedPanel === 'main' ? '100%' : '0%')
                    : `${mainHeight}%`,
                  display: maximizationState.isMaximized && maximizationState.maximizedPanel !== 'main' ? 'none' : 'block',
                  overflow: "hidden"
                }}
                onMouseDown={() => setActiveContext('main')}
              >
                <MainPanel
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onAdd={addTab}
                  onClose={closeTab}
                  onActivate={activateTab}
                  onPin={pinTab}
                  onReorder={reorderTabs}
                  onUpdate={updateTab}
                  isMaximized={maximizationState.isMaximized && maximizationState.maximizedPanel === 'main'}
                  onToggleMaximize={() => toggleMaximize('main')}
                />
              </div>

              {/* Splitter */}
              {!maximizationState.isMaximized && (
                <Splitter onResize={handleResize} />
              )}

              {/* Bottom Panel Area */}
              <div
                style={{
                  height: maximizationState.isMaximized
                    ? (maximizationState.maximizedPanel === 'bottom' ? '100%' : '0%')
                    : `${100 - mainHeight}%`,
                  display: maximizationState.isMaximized && maximizationState.maximizedPanel !== 'bottom' ? 'none' : 'block',
                  overflow: "hidden"
                }}
                onMouseDown={() => setActiveContext('bottom')}
              >
                <BottomPanel
                  tabs={dataTabs.tabs}
                  activeTabId={dataTabs.activeTabId}
                  addTab={dataTabs.addTab}
                  closeTab={dataTabs.closeTab}
                  activateTab={dataTabs.activateTab}
                  pinTab={dataTabs.pinTab}
                  reorderTabs={dataTabs.reorderTabs}
                  updateTab={dataTabs.updateTab}
                  isMaximized={maximizationState.isMaximized && maximizationState.maximizedPanel === 'bottom'}
                  onToggleMaximize={() => toggleMaximize('bottom')}
                />
              </div>
            </div>

            {/* RIGHT PANEL – PEŁNA WYSOKOŚĆ */}
            <RightPanel
              tab={activeContext === 'main' ? activeTab : null}
              onUpdateTab={updateTab}
              activeDataTab={activeContext === 'bottom' ? activeDataTab : null}
              onUpdateDataTab={dataTabs.updateTab}
            />
          </div>
        </div>

        <StatusBar />
      </div>
    </FluentProvider>
  );
};
