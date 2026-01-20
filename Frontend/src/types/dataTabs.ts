import type { IconType } from "react-icons";

export type DataTabType =
  | "table"
  | "log"
  | "stats"
  | "query"
  | "history";

export type DataSource = unknown;
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'starts' | 'ends';

export interface FilterCondition {
  id: string;
  column: string;
  operator: FilterOperator;
  value: string;
}

export type FilterSet = FilterCondition[];
export type SortDirection = 'asc' | 'desc' | 'calculated' | 'none';

export interface ColumnSort {
  column: string;
  direction: SortDirection;
}

export interface SortConfig {
  columns: ColumnSort[];
  isMultiSort: boolean;
  isCustomSort: boolean;
  isStandardSort: boolean;
  useCalculatedValues: boolean;
}

export type SearchConfig = {
  terms: string[];
  isRealTime: boolean;
  isRegex: boolean;
  isMultiTable: boolean;
  columns: Record<string, string>; // column -> term
};


export interface GroupingConfig {
  groupByColumn: string;
  groupedColumns: string[];
}


export interface DataTab {
  id: string;
  title: string;
  type: DataTabType;
  icon: IconType;
  dataSource: DataSource;
  filters: FilterSet;
  sorting: SortConfig;
  search: SearchConfig;
  grouping?: GroupingConfig;
  savedFilterSets?: Record<string, FilterSet>;
  isDirty: boolean;
  isClosable: boolean;
  isPinned: boolean;
  content?: any;
}
