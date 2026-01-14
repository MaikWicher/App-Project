import type { IconType } from "react-icons";

export type VisualizationType =
  | "chart"
  | "graph"
  | "dashboard"
  | "comparison"

export type ChartType =
  | "line"
  | "bar"
  | "column"
  | "pie"
  | "flow"
  | "star"
  | "stat"
  | "candlestick";

export interface VisualizationTab {
  id: string;
  title: string;
  type: VisualizationType;
  chartType?: ChartType;
  icon: IconType;
  content: any;
  isDirty: boolean;
  isClosable: boolean;
  isPinned: boolean;
}
