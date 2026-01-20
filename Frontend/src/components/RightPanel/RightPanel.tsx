// components/RightPanel/RightPanel.tsx
import React from "react";
import type { VisualizationTab } from "../../types/visualization";
import type { DataTab } from "../../types/dataTabs";
import { DataTableConfig } from "./sections";

import { PanelEmpty } from "./PanelEmpty";
import { PanelHeader } from "./PanelHeader";

import {
  VisualizationSettings,
  TableChartConfig,
  GraphEditor,
  DataInspector,
  DataEditor,
  DashboardEditor,
  ComparisonEditor,
  AggregationTools,
  DuckDbConfigSection
} from "./sections";

import "./rightPanel.css";

interface RightPanelProps {
  tab: VisualizationTab | null;
  onUpdateTab: (id: string, changes: Partial<VisualizationTab>) => void;
  activeDataTab?: DataTab | null;
  onUpdateDataTab?: (id: string, changes: Partial<DataTab>) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ tab, onUpdateTab, activeDataTab, onUpdateDataTab }) => {
  // Priority: Data Tab Config if selected
  if (activeDataTab && activeDataTab.type === 'table') {
    return (
      <aside className="right-panel">
        <PanelHeader title={`Konfiguracja: ${activeDataTab.title}`} />
        <div className="panel-scroll">
          <DataTableConfig tab={activeDataTab} onUpdate={onUpdateDataTab!} />
        </div>
      </aside>
    );
  }

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

        {/* DUCKDB IMPORT */}
        {tab.type === "duckdb" && (
          <>
            <VisualizationSettings tab={tab} onUpdate={onUpdateTab} />
            <DuckDbConfigSection tab={tab} onUpdate={onUpdateTab} />
            <AggregationTools tab={tab} onUpdate={onUpdateTab} />
            {/* Reuse TableChartConfig for generic settings (legend, sort) if compatible */}
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
        {tab.type !== "chart" && tab.type !== "graph" && tab.type !== "dashboard" && tab.type !== "comparison" && tab.type !== "duckdb" && tab.type !== "import" && (
          <div className="panel-section">
            <h4>⚠️ Nieznany typ wizualizacji</h4>
            <p>Typ: {tab.type}</p>
          </div>
        )}
      </div>
    </aside>
  );
};
