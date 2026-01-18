import type { IconType } from "react-icons";

export type VisualizationType =
  | "chart"
  | "graph"
  | "dashboard"
  | "comparison"
  | "duckdb";

export type ChartType =
  | "line"
  | "bar"
  | "column"
  | "pie"
  | "flow"
  | "star"
  | "stat"
  | "candlestick";

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
}

export type VisualizationContent = GraphConfig | ChartConfig | DuckDBConfig | null;

export interface VisualizationTab {
  id: string;
  title: string;
  type: VisualizationType;
  chartType?: ChartType;
  icon: IconType;
  content: VisualizationContent;
  selectedElementId?: string; // New: Track selected node/edge
  isDirty: boolean;
  isClosable: boolean;
  isPinned: boolean;
}
