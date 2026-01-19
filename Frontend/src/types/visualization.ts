import type { IconType } from "react-icons";

export type VisualizationType =
  | "chart"
  | "graph"
  | "dashboard"
  | "comparison"
  | "duckdb"
  | "import";

export type ChartType =
  | "line"
  | "bar"
  | "column"
  | "pie"
  | "flow"
  | "star"
  | "stat"
  | "candlestick"
  | "table";

export interface GraphConfig {
  layout: 'grid' | 'circle' | 'breadthfirst' | 'dagre' | 'cose';
  isDirected: boolean;
  nodes: Array<{ data: { id: string; label: string; value?: number;[key: string]: any } }>;
  edges: Array<{ data: { source: string; target: string; label?: string; value?: number;[key: string]: any } }>;
  style?: {
    nodeColor?: string;
    edgeColor?: string;
    nodeSize?: number;
    edgeWidth?: number;
  };
  filter?: {
    minNodeValue?: number;
    minEdgeValue?: number;
  };
}

export interface ChartConfig {
  showLegend: boolean;
  sortByValue: boolean;
  series: Array<{ name: string; data: number[] }>;
  categories: string[];
}

export interface DuckDBConfig {
  tableName: string;
  columns?: string[];
  xColumn?: string;
  yColumns?: string[];
  // ChartConfig compatibility
  showLegend?: boolean;
  sortByValue?: boolean;
  // Cache synthetic series for aggregation tools
  series?: Array<{ name: string; data: number[] }>;
  categories?: string[];
}

export type VisualizationContent = GraphConfig | ChartConfig | DuckDBConfig | null;

export interface VisualizationTab {
  id: string;
  title: string;
  type: VisualizationType;
  chartType?: ChartType;
  icon: IconType;
  content: VisualizationContent;
  selectedElementId?: string;
  isDirty: boolean;
  isClosable: boolean;
  isPinned: boolean;
}
