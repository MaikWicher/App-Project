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

export const App: React.FC = () => {
  const [mainHeight, setMainHeight] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const { tabs, activeTabId, updateTab, addTab, closeTab, activateTab, pinTab, reorderTabs } = useVisualizationTabs();
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  // Hoisted BottomPanel state
  const dataTabs = useDataTabs();
  const activeDataTab = dataTabs.tabs.find(t => t.id === dataTabs.activeTabId) ?? null;

  const { setStatus, setProgress, setLoading } = useAppStatus();

  useEffect(() => {
    const initializeApp = async () => {
      setLoading(true);
      setStatus("Inicjalizacja...");

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
      setStatus("Łączenie z backendem...");
      setProgress(30);

      // Phase 2: Loading Tables (Simulated or Real)
      await new Promise(r => setTimeout(r, 800));
      setStatus("Ładowanie tabel danych...");
      setProgress(70);

      // Phase 3: Finalizing
      await new Promise(r => setTimeout(r, 400));
      setStatus("Finalizacja...");
      setProgress(90);

      await new Promise(r => setTimeout(r, 200));
      setProgress(100);
      setStatus("Gotowy");
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
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.clientHeight;
    const deltaPercent = (deltaPx / totalHeight) * 100;
    setMainHeight(h => Math.min(80, Math.max(20, h + deltaPercent)));
  };

  const handleTableDeleted = (tableName: string) => {
    // Znajdź zakładkę z tą tabelą
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
              }
            }}
            onTableDeleted={handleTableDeleted}
          />

          {/* CENTRALNA CZĘŚĆ + RIGHT PANEL */}
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
            {/* MAIN + BOTTOM */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ height: `${mainHeight}%`, overflow: "hidden" }}>
                <MainPanel
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onAdd={addTab}
                  onClose={closeTab}
                  onActivate={activateTab}
                  onPin={pinTab}
                  onReorder={reorderTabs}
                  onUpdate={updateTab}
                />
              </div>

              <Splitter onResize={handleResize} />

              <div style={{ height: `${100 - mainHeight}%`, overflow: "hidden" }}>
                <BottomPanel
                  tabs={dataTabs.tabs}
                  activeTabId={dataTabs.activeTabId}
                  addTab={dataTabs.addTab}
                  closeTab={dataTabs.closeTab}
                  activateTab={dataTabs.activateTab}
                  pinTab={dataTabs.pinTab}
                  reorderTabs={dataTabs.reorderTabs}
                  updateTab={dataTabs.updateTab}
                />
              </div>
            </div>

            {/* RIGHT PANEL – PEŁNA WYSOKOŚĆ */}
            <RightPanel
              tab={activeTab}
              onUpdateTab={updateTab}
              activeDataTab={activeDataTab}
              onUpdateDataTab={dataTabs.updateTab}
            />
          </div>
        </div>

        <StatusBar />
      </div>
    </FluentProvider>
  );
};
