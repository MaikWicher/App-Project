import type { IconType } from "react-icons";

export type DataTabType =
  | "table"
  | "log"
  | "stats"
  | "query"
  | "history";

export type DataSource = unknown;
export type FilterSet = unknown;
export type SortConfig = unknown;

export interface DataTab {
  id: string;
  title: string;
  type: DataTabType;
  icon: IconType;
  dataSource: DataSource;
  filters: FilterSet;
  sorting: SortConfig;
  isDirty: boolean;
  isClosable: boolean;
  isPinned: boolean;
}
