import type { IconType } from "react-icons";

export type SideBarSectionType =
  | "explorer"
  | "search"
  | "filters"
  | "analytics"
  | "settings"
  | "history";

export interface SideBarSection {
  id: SideBarSectionType;
  title: string;
  icon: IconType;
  isPinned: boolean;
}
