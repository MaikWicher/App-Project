import React from "react";
import type { DataTab } from "../../types/dataTabs";
import { DataTablesTab } from "./tabs/DataTablesTab";
import { SystemLogsTab } from "./tabs/SystemLogsTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { SqlResultsTab } from "./tabs/SqlResultsTab";
import { HistoryTab } from "./tabs/HistoryTab";

export const DataTabRenderer: React.FC<{ tab: DataTab }> = ({ tab }) => {
  switch (tab.type) {
    case "table":
      return <DataTablesTab tab={tab} />;
    case "log":
      return <SystemLogsTab tab={tab} />;
    case "stats":
      return <PerformanceTab tab={tab} />;
    case "query":
      return <SqlResultsTab tab={tab} />;
    case "history":
      return <HistoryTab tab={tab} />;
    default:
      return <div>Nieznany typ zakładki: {tab.type}</div>;
  }
};
