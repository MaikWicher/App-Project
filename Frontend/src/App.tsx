// src/App.tsx
import React, { useState, useRef } from "react";
import { FluentProvider, webDarkTheme } from "@fluentui/react-components";
import { Ribbon } from "./components/Ribbon";
import { SideBar } from "./components/SideBar/SideBar";
import { MainPanel } from "./components/MainPanel/MainPanel";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import { StatusBar } from "./components/StatusBar";
import { Splitter } from "./components/Splitter";
import { RightPanel } from "./components/RightPanel/RightPanel";
import { useVisualizationTabs } from "./hooks/useVisualizationTabs";
import "./styles.css";

export const App: React.FC = () => {
  const [mainHeight, setMainHeight] = useState(60);
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const { tabs, activeTabId, updateTab, addTab, closeTab, activateTab, pinTab, reorderTabs } = useVisualizationTabs();
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  const handleResize = (deltaPx: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.clientHeight;
    const deltaPercent = (deltaPx / totalHeight) * 100;
    setMainHeight(h => Math.min(80, Math.max(20, h + deltaPercent)));
  };

  return (
    <FluentProvider theme={webDarkTheme} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="app-root" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Ribbon />

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
                <BottomPanel />
              </div>
            </div>

            {/* RIGHT PANEL – PEŁNA WYSOKOŚĆ */}
            <RightPanel tab={activeTab} onUpdateTab={updateTab} />
          </div>
        </div>

        <StatusBar />
      </div>
    </FluentProvider>
  );
};
