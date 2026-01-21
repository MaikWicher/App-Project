import { useReducer, useEffect } from "react";
import type { VisualizationTab, VisualizationType, ChartType } from "../types/visualization";
import { FaChartLine, FaProjectDiagram, FaTachometerAlt, FaColumns, FaUpload } from "react-icons/fa";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type State = { tabs: VisualizationTab[]; activeTabId: string | null };


type Action =
  | { type: "ADD_TAB"; tabType: VisualizationType; chartType?: ChartType; initData?: any; title: string; content?: VisualizationTab['content'] }
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
  duckdb: FaChartLine,
  import: FaUpload,
};

const getDefaultContent = (type: VisualizationType, t: TFunction, initData?: any): VisualizationTab['content'] => {
  if (type === 'graph') {
    return {
      tableName: initData?.tableName,
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
      tableName: initData?.tableName,
      showLegend: true,
      sortByValue: false,
      series: [{ name: t('tabs.content.sampleData'), data: [10, 40, 25, 50, 49, 60, 70, 91] }],
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]
    };
  }
  return null;
};

const uuidv4 = () => {
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 9);
};

const createTab = (type: VisualizationType, title: string, chartType?: ChartType, initData?: any, content?: VisualizationTab['content']): VisualizationTab => ({
  id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : uuidv4(),
  title,
  type,
  chartType,
  icon: iconMap[type],
  content: content || (type === "duckdb" && initData ? { tableName: initData.tableName } : null), // getDefaultContent logic moved to addTab, but keeping this safe
  isDirty: false,
  isClosable: true,
  isPinned: false
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TAB":
      const newTab = createTab(action.tabType, action.title, action.chartType, action.initData, action.content);
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
  const { t } = useTranslation();

  // Load config on mount
  useEffect(() => {
    const load = async () => {
      if (window.electron?.loadConfig) {
        try {
          const saved = await window.electron.loadConfig();
          if (saved && saved.tabs) {
            // Restore icons (passed as functions, lost in JSON)
            const restoredTabs = saved.tabs.map((t: any) => ({
              ...t,
              icon: iconMap[t.type as keyof typeof iconMap] || iconMap.chart
            }));

            dispatch({ type: "REORDER_TABS", tabs: restoredTabs });
            if (saved.activeTabId) {
              dispatch({ type: "ACTIVATE_TAB", tabId: saved.activeTabId });
            }
          }
        } catch (e) {
          console.error("Failed to load config", e);
        }
      }
    };
    load();
  }, []);

  // Save config on change (debounced manually or just effect)
  useEffect(() => {
    if (state.tabs.length > 0 && window.electron?.saveConfig) {
      const save = setTimeout(() => {
        window.electron.saveConfig({
          tabs: state.tabs,
          activeTabId: state.activeTabId
        });
      }, 1000); // Debounce 1s
      return () => clearTimeout(save);
    }
  }, [state]);

  return {
    ...state,
    addTab: (type: VisualizationType, chartType?: ChartType, initData?: any) => {
      if (type === "duckdb" && initData?.tableName) {
        const existingTab = state.tabs.find(t => t.type === "duckdb" && (t.content as any)?.tableName === initData.tableName);
        if (existingTab) {
          dispatch({ type: "ACTIVATE_TAB", tabId: existingTab.id });
          return;
        }
      }

      let title = t('tabs.defaultTitles.new');
      if (chartType) {
        title = t('tabs.defaultTitles.chart', { type: chartType });
      } else if (type === "duckdb" && initData?.tableName) {
        title = initData.tableName;
      } else if (type === "import") {
        title = t('tabs.defaultTitles.import');
      } else if (type === "duckdb") {
        title = t('tabs.defaultTitles.explorer');
      }

      let content: VisualizationTab['content'] = type === "duckdb" && initData ? { tableName: initData.tableName } : getDefaultContent(type, t, initData);

      dispatch({ type: "ADD_TAB", tabType: type, chartType, initData, title, content });
    },
    activateTab: (id: string) => dispatch({ type: "ACTIVATE_TAB", tabId: id }),
    closeTab: (id: string) => dispatch({ type: "CLOSE_TAB", tabId: id }),
    pinTab: (id: string) => dispatch({ type: "PIN_TAB", tabId: id }),
    reorderTabs: (tabs: VisualizationTab[]) => dispatch({ type: "REORDER_TABS", tabs }),
    updateTab: (id: string, changes: Partial<VisualizationTab>) => dispatch({ type: "UPDATE_TAB", tabId: id, changes })
  };
};
