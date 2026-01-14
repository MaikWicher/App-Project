import React, { useState, useRef } from "react";
import { Ribbon } from "./components/Ribbon";
import { SideBar } from "./components/SideBar/SideBar";
import { MainPanel } from "./components/MainPanel/MainPanel";
import { BottomPanel } from "./components/BottomPanel/BottomPanel";
import { StatusBar } from "./components/StatusBar";
import { Splitter } from "./components/Splitter";
import "./styles.css";

export const App: React.FC = () => {
  const [mainHeight, setMainHeight] = useState(60); // %
  const containerRef = useRef<HTMLDivElement>(null);
  const [pinned, setPinned] = useState(true);

  const handleResize = (deltaPx: number) => {
    if (!containerRef.current) return;
    const totalHeight = containerRef.current.clientHeight;
    const deltaPercent = (deltaPx / totalHeight) * 100;
    setMainHeight(h => Math.min(80, Math.max(20, h + deltaPercent)));
  };

  return (
    <div className="app-root">
      <Ribbon />

      <div className="workspace" ref={containerRef}>
        <SideBar
          pinned={pinned}
          onTogglePinned={() => setPinned(prev => !prev)}
        />

        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ height: `${mainHeight}%`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <MainPanel />
          </div>

          <Splitter onResize={handleResize} />

          <div style={{ height: `${100 - mainHeight}%`, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <BottomPanel />
          </div>
        </div>
      </div>

      <StatusBar />
    </div>
  );
};
