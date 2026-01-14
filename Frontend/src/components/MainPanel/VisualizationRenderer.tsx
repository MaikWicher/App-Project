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

interface Props {
  tab: VisualizationTab;
}

export const VisualizationRenderer: React.FC<Props> = ({ tab }) => {
  switch (tab.type) {
    case "chart":
      switch (tab.chartType) {
        case "line":
          return <LineChartView title={tab.title} />;
        case "bar":
          return <BarChartView tab={tab} />;
        case "column":
          return <ColumnChartView title={tab.title} />;
        case "pie":
          return <PieChartView />;
        case "flow":
          return <FlowChartView />;
        case "star":
          return <StarChartView />;
        case "stat":
          return <StatChartView />;
        case "candlestick":
          return <CandlestickChartView tab={tab} />;
        default:
          return <div className="viz-placeholder">Nieznany typ wykresu</div>;
      }

    case "graph":
      return <GraphView tab={tab} />;

    case "dashboard":
      return <DashboardView tab={tab} />;

    case "comparison":
      return <ComparisonView tab={tab} />;

    default:
      return <div className="viz-placeholder">Wybierz typ wizualizacji</div>;
  }
};
