import React from "react";
import type { DataTab } from "../../types/dataTabs";
import { DataTablesTab } from "./tabs/DataTablesTab";
import { SystemLogsTab } from "./tabs/SystemLogsTab";
import { PerformanceTab } from "./tabs/PerformanceTab";
import { SqlResultsTab } from "./tabs/SqlResultsTab";
import { HistoryTab } from "./tabs/HistoryTab";

interface Props {
  tab: DataTab;
  onUpdate: (id: string, changes: Partial<DataTab>) => void;
}

export const DataTabRenderer: React.FC<Props> = ({ tab, onUpdate }) => {
  switch (tab.type) {
    case "table":
      return <DataTablesTab tab={tab} onUpdate={onUpdate} />;
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
