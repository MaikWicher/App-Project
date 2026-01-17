// components/RightPanel/RightPanel.tsx
import React from "react";
import type { VisualizationTab } from "../../types/visualization";

import { PanelEmpty } from "./PanelEmpty";
import { PanelHeader } from "./PanelHeader";

import { VisualizationSettings } from "./sections/VisualizationSettings";
import { TableChartConfig } from "./sections/TableChartConfig";
import { GraphEditor } from "./sections/GraphEditor";
import { DataInspector } from "./sections/DataInspector";
import { DataEditor } from "./sections/DataEditor";
import { DashboardEditor } from "./sections/DashBoardEditor";
import { ComparisonEditor } from "./sections/ComparisonEditor";
import { AggregationTools } from "./sections/AggregationTools";

import "./rightPanel.css";

interface RightPanelProps {
  tab: VisualizationTab | null;
  onUpdateTab: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ tab, onUpdateTab }) => {
  if (!tab) {
    return <PanelEmpty />;
  }

  return (
    <aside className="right-panel">
      <PanelHeader title={tab.title} />

      <div className="panel-scroll">
        {/* WSPÓLNE DLA WIĘKSZOŚCI */}
        <DataInspector tab={tab} />
        <DataEditor tab={tab} onUpdate={onUpdateTab} />
        <AggregationTools tab={tab} onUpdate={onUpdateTab} />

        {/* WIZUALIZACJE */}
        {tab.type === "chart" && (
          <>
            <VisualizationSettings tab={tab} onUpdate={onUpdateTab} />
            <TableChartConfig tab={tab} onUpdate={onUpdateTab} />
          </>
        )}

        {/* GRAFY */}
        {tab.type === "graph" && <GraphEditor tab={tab} onUpdate={onUpdateTab} />}

        {/* DASHBOARD */}
        {tab.type === "dashboard" && <DashboardEditor tab={tab} />}

        {/* PORÓWNANIA */}
        {tab.type === "comparison" && <ComparisonEditor tab={tab} />}

        {/* FALLBACK INFO */}
        {tab.type !== "chart" && tab.type !== "graph" && tab.type !== "dashboard" && tab.type !== "comparison" && (
          <div className="panel-section">
            <h4>⚠️ Nieznany typ wizualizacji</h4>
            <p>Typ: {tab.type}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
