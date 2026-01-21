import { useReducer } from "react";
import type { DataTab, DataTabType } from "../types/dataTabs";
import {
  FaTable,
  FaFileAlt,
  FaChartBar,
  FaDatabase,
  FaHistory
} from "react-icons/fa";

type State = {
  tabs: DataTab[];
  activeTabId: string | null;
};

type Action =
  | { type: "ADD_TAB"; tabType: DataTabType; title?: string; initData?: any }
  | { type: "ACTIVATE_TAB"; tabId: string }
  | { type: "CLOSE_TAB"; tabId: string }
  | { type: "PIN_TAB"; tabId: string }
  | { type: "REORDER_TABS"; newOrder: DataTab[] }
  | { type: "UPDATE_TAB"; tabId: string; changes: Partial<DataTab> };

const iconMap = {
  table: FaTable,
  log: FaFileAlt,
  stats: FaChartBar,
  query: FaDatabase,
  history: FaHistory
};

const createTab = (type: DataTabType, title?: string, initData?: any): DataTab => ({
  id: crypto.randomUUID(),
  title: title ?? "Nowa zakładka",
  type,
  icon: iconMap[type],
  content: initData,
  dataSource: null,
  filters: [],
  sorting: {
    columns: [],
    isMultiSort: false,
    isCustomSort: false,
    isStandardSort: false,
    useCalculatedValues: false
  },
  search: {
    terms: [""],
    isRealTime: true,
    isRegex: false,
    isMultiTable: false,
    columns: {}
  },
  savedFilterSets: {},
  isDirty: false,
  isClosable: true,
  isPinned: false
});

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TAB": {
      const tab = createTab(action.tabType, action.title, action.initData);
      return {
        tabs: [...state.tabs, tab],
        activeTabId: tab.id
      };
    }

    case "ACTIVATE_TAB":
      return { ...state, activeTabId: action.tabId };

    case "CLOSE_TAB": {
      const closingIndex = state.tabs.findIndex(t => t.id === action.tabId);
      if (closingIndex === -1) return state;

      const newTabs = state.tabs.filter(t => t.id !== action.tabId);

      let newActiveTabId = state.activeTabId;

      if (state.activeTabId === action.tabId) {
        newActiveTabId =
          newTabs.length > 0
            ? newTabs[Math.min(closingIndex, newTabs.length - 1)].id
            : null;
      }

      return { tabs: newTabs, activeTabId: newActiveTabId };
    }

    case "PIN_TAB":
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.id === action.tabId ? { ...t, isPinned: !t.isPinned } : t
        )
      };

    case "REORDER_TABS":
      return { ...state, tabs: action.newOrder };

    case "UPDATE_TAB":
      return {
        ...state,
        tabs: state.tabs.map(t =>
          t.id === action.tabId ? { ...t, ...action.changes } : t
        )
      };

    default:
      return state;
  }
};

export const useDataTabs = () => {
  const [state, dispatch] = useReducer(reducer, { tabs: [], activeTabId: null });

  return {
    ...state,
    addTab: (type: DataTabType, title?: string, initData?: any) =>
      dispatch({ type: "ADD_TAB", tabType: type, title, initData }),
    activateTab: (id: string) =>
      dispatch({ type: "ACTIVATE_TAB", tabId: id }),
    closeTab: (id: string) =>
      dispatch({ type: "CLOSE_TAB", tabId: id }),
    pinTab: (id: string) =>
      dispatch({ type: "PIN_TAB", tabId: id }),
    reorderTabs: (newOrder: DataTab[]) =>
      dispatch({ type: "REORDER_TABS", newOrder }),
    updateTab: (id: string, changes: Partial<DataTab>) =>
      dispatch({ type: "UPDATE_TAB", tabId: id, changes })
  };
};
