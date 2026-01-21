import React from "react";
import type { VisualizationTab } from "../../types/visualization";
import { LineChartView } from "./visualizations/LineChartView";
import { BarChartView } from "./visualizations/BarChartView";
import { ColumnChartView } from "./visualizations/ColumnChartView";
import { PieChartView } from "./visualizations/PieChartView";
import { FlowChartView } from "./visualizations/FlowChartView";
import { StarChartView } from "./visualizations/StarChartView";
import { StatChartView } from "./visualizations/StatChartView";
import { CandlestickChartView } from "./visualizations/CandlestickChartView";
import { GraphView } from "./visualizations/GraphView";
import { DashboardView } from "./visualizations/DashboardView";
import { ComparisonView } from "./visualizations/ComparisonView";
import { ImportPage } from "../../pages/ImportPage";
import { DuckDbView } from "./visualizations/DuckDbView";
import { ErrorBoundary } from "../ErrorBoundary";



interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
  onAdd: (type: any, chartType?: any, initData?: any) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const VisualizationRenderer: React.FC<Props> = ({ tab, onUpdate, onAdd }) => {
  const content = (() => {
    switch (tab.type) {
      case "chart":
        switch (tab.chartType) {
          case "line": return <LineChartView tab={tab} title={tab.title} />;
          case "column": return <ColumnChartView tab={tab} title={tab.title} />;
          case "bar": return <BarChartView tab={tab} />;
          case "pie": return <PieChartView tab={tab} />;
          case "flow": return <FlowChartView tab={tab} />;
          case "star": return <StarChartView tab={tab} />;
          case "stat": return <StatChartView tab={tab} />;
          case "candlestick": return <CandlestickChartView tab={tab} />;
          default: return <div className="viz-placeholder">Nieznany typ wykresu</div>;
        }

      case "graph": return <GraphView tab={tab} onUpdate={onUpdate} />;
      case "dashboard": return <DashboardView tab={tab} />;
      case "comparison": return <ComparisonView tab={tab} />;
      case "import": return <ImportPage onImportSuccess={(tableName) => onAdd("duckdb", undefined, { tableName })} />;
      case "duckdb": return <DuckDbView tab={tab} onUpdate={onUpdate} />;
      default: return <div className="viz-placeholder">Wybierz typ wizualizacji</div>;
    }
  })();

  return (
    <div key={tab.id} style={{ height: '100%', position: 'relative' }}>
      <ErrorBoundary>
        {content}
      </ErrorBoundary>
    </div>
  );
};
