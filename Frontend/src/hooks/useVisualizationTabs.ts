import { useReducer } from "react";
import type { VisualizationTab, VisualizationType, ChartType } from "../types/visualization";
import { FaChartLine, FaProjectDiagram, FaTachometerAlt, FaColumns, FaDatabase, FaUpload } from "react-icons/fa";

type State = { tabs: VisualizationTab[]; activeTabId: string | null };


type Action =
  | { type: "ADD_TAB"; tabType: VisualizationType; chartType?: ChartType; initData?: any }
  | { type: "ACTIVATE_TAB"; tabId: string }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "PIN_TAB"; tabId: string }
  | { type: "REORDER_TABS"; tabs: VisualizationTab[] }
  | { type: "UPDATE_TAB"; tabId: string; changes: Partial<VisualizationTab> };

const iconMap = {
  chart: FaChartLine,
  graph: FaProjectDiagram,
  dashboard: FaTachometerAlt,
  comparison: FaColumns,
  duckdb: FaDatabase,
  import: FaUpload,
};

const getDefaultContent = (type: VisualizationType): VisualizationTab['content'] => {
  if (type === 'graph') {
    return {
      layout: 'cose',
      isDirected: false,
      nodes: [
        { data: { id: "a", label: "A" } },
        { data: { id: "b", label: "B" } },
        { data: { id: "c", label: "C" } },
      ],
      edges: [
        { data: { source: "a", target: "b", label: "A → B" } },
        { data: { source: "b", target: "c", label: "B → C" } },
        { data: { source: "a", target: "c", label: "A → C" } }
      ]
    };
  }
  if (type === 'chart') {
    return {
      showLegend: true,
      sortByValue: false,
      series: [{ name: "Przykładowe dane", data: [10, 40, 25, 50, 49, 60, 70, 91] }],
      categories: ["Sty", "Lut", "Mar", "Kwi", "Maj", "Cze", "Lip", "Sie"]
    };
  }
  return null;
};

const createTab = (type: VisualizationType, chartType?: ChartType, initData?: any): VisualizationTab => ({
  id: crypto.randomUUID(),
  title: chartType ? `Wykres: ${chartType}` : (type === "duckdb" && initData?.tableName ? initData.tableName : (type === "import" ? "Import Danych" : (type === "duckdb" ? "DuckDB Explorer" : "Nowa wizualizacja"))),
  type,
  chartType,
  icon: iconMap[type],
  content: type === "duckdb" && initData ? { tableName: initData.tableName } : getDefaultContent(type),
  isDirty: false,
  isClosable: true,
  isPinned: false
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TAB":
      const newTab = createTab(action.tabType, action.chartType, action.initData);
      return { tabs: [...state.tabs, newTab], activeTabId: newTab.id };
    case "ACTIVATE_TAB":
      return { ...state, activeTabId: action.tabId };
    case "PIN_TAB":
      return { ...state, tabs: state.tabs.map(t => t.id === action.tabId ? { ...t, isPinned: !t.isPinned } : t) };
    case "CLOSE_TAB":
      const tabs = state.tabs.filter(t => t.id !== action.tabId);
      return { tabs, activeTabId: state.activeTabId === action.tabId ? (tabs.length ? tabs[tabs.length - 1].id : null) : state.activeTabId };
    case "REORDER_TABS":
      return { ...state, tabs: action.tabs };
    case "UPDATE_TAB":
      return {
        ...state,
        tabs: state.tabs.map(t => t.id === action.tabId ? { ...t, ...action.changes } : t)
      };
    default:
      return state;
  }
};

export const useVisualizationTabs = () => {
  const [state, dispatch] = useReducer(reducer, { tabs: [], activeTabId: null });

  return {
    ...state,
    addTab: (type: VisualizationType, chartType?: ChartType, initData?: any) => dispatch({ type: "ADD_TAB", tabType: type, chartType, initData }),
    activateTab: (id: string) => dispatch({ type: "ACTIVATE_TAB", tabId: id }),
    closeTab: (id: string) => dispatch({ type: "CLOSE_TAB", tabId: id }),
    pinTab: (id: string) => dispatch({ type: "PIN_TAB", tabId: id }),
    reorderTabs: (tabs: VisualizationTab[]) => dispatch({ type: "REORDER_TABS", tabs }),
    updateTab: (id: string, changes: Partial<VisualizationTab>) => dispatch({ type: "UPDATE_TAB", tabId: id, changes })
  };
};
