// components/RightPanel/RightPanel.tsx
import React from "react";
import type { VisualizationTab } from "../../types/visualization";

import { PanelEmpty } from "./PanelEmpty";
import { PanelHeader } from "./PanelHeader";

import { VisualizationSettings } from "./sections/VisualizationSettings";
import { TableChartConfig } from "./sections/TableChartConfig";
import { GraphEditor } from "./sections/GraphEditor";
import { DataInspector } from "./sections/DataInspector";
import { DashboardEditor } from "./sections/DashBoardEditor";
import { ComparisonEditor } from "./sections/ComparisonEditor";
import { AggregationTools } from "./sections/AggregationTools";

import "./rightPanel.css";

interface RightPanelProps {
  tab: VisualizationTab | null;
}

export const RightPanel: React.FC<RightPanelProps> = ({ tab }) => {
  if (!tab) {
    return <PanelEmpty />;
  }

  return (
    <aside className="right-panel">
      <PanelHeader title={tab.title} />

      <div className="panel-scroll">
        {/* WSPÓLNE DLA WIĘKSZOŚCI */}
        <DataInspector tab={tab} />
        <AggregationTools tab={tab} />

        {/* WIZUALIZACJE */}
        {tab.type === "chart" && (
          <>
            <VisualizationSettings tab={tab} />
            <TableChartConfig tab={tab} />
          </>
        )}

        {/* GRAFY */}
        {tab.type === "graph" && <GraphEditor tab={tab} />}

        {/* DASHBOARD */}
        {tab.type === "dashboard" && <DashboardEditor tab={tab} />}

        {/* PORÓWNANIA */}
        {tab.type === "comparison" && <ComparisonEditor tab={tab} />}
      </div>
    </aside>
  );
};
