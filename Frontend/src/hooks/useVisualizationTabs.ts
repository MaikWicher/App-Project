import { useReducer } from "react";
import type { VisualizationTab, VisualizationType, ChartType } from "../types/visualization";
import { FaChartLine, FaProjectDiagram, FaTachometerAlt, FaColumns } from "react-icons/fa";

type State = { tabs: VisualizationTab[]; activeTabId: string | null };

type Action =
  | { type: "ADD_TAB"; tabType: VisualizationType; chartType?: ChartType }
  | { type: "ACTIVATE_TAB"; tabId: string }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "PIN_TAB"; tabId: string }
  | { type: "REORDER_TABS"; tabs: VisualizationTab[] };

const iconMap = {
  chart: FaChartLine,
  graph: FaProjectDiagram,
  dashboard: FaTachometerAlt,
  comparison: FaColumns,
};

const createTab = (type: VisualizationType, chartType?: ChartType): VisualizationTab => ({
  id: crypto.randomUUID(),
  title: chartType ? `Wykres: ${chartType}` : "Nowa wizualizacja",
  type,
  chartType,
  icon: iconMap[type],
  content: null,
  isDirty: false,
  isClosable: true,
  isPinned: false
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TAB":
      const newTab = createTab(action.tabType, action.chartType);
      return { tabs: [...state.tabs, newTab], activeTabId: newTab.id };
    case "ACTIVATE_TAB":
      return { ...state, activeTabId: action.tabId };
    case "PIN_TAB":
      return { ...state, tabs: state.tabs.map(t => t.id === action.tabId ? { ...t, isPinned: !t.isPinned } : t) };
    case "CLOSE_TAB":
      const tabs = state.tabs.filter(t => t.id !== action.tabId);
      return { tabs, activeTabId: tabs.length ? tabs[tabs.length-1].id : null };
    case "REORDER_TABS":
      return { ...state, tabs: action.tabs };
    default:
      return state;
  }
};

export const useVisualizationTabs = () => {
  const [state, dispatch] = useReducer(reducer, { tabs: [], activeTabId: null });

  return {
    ...state,
    addTab: (type: VisualizationType, chartType?: ChartType) => dispatch({ type: "ADD_TAB", tabType: type, chartType }),
    activateTab: (id: string) => dispatch({ type: "ACTIVATE_TAB", tabId: id }),
    closeTab: (id: string) => dispatch({ type: "CLOSE_TAB", tabId: id }),
    pinTab: (id: string) => dispatch({ type: "PIN_TAB", tabId: id }),
    reorderTabs: (tabs: VisualizationTab[]) => dispatch({ type: "REORDER_TABS", tabs })
  };
};
