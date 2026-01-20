import type { DataTab } from "../../types/dataTabs";
import { BottomPanelTabsBar } from "./BottomPanelTabsBar";
import "./bottomPanel.css";
import { DataTabRenderer } from "./DataTabRenderer";

interface Props {
  tabs: DataTab[];
  activeTabId: string | null;
  addTab: (type: any, title?: string) => void;
  closeTab: (id: string) => void;
  activateTab: (id: string) => void;
  pinTab: (id: string) => void;
  reorderTabs: (newOrder: DataTab[]) => void;
  updateTab: (id: string, changes: Partial<DataTab>) => void;
}

export const BottomPanel: React.FC<Props> = ({
  tabs,
  activeTabId,
  addTab,
  closeTab,
  activateTab,
  pinTab,
  reorderTabs,
  updateTab
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  return (
    <div className="bottom-panel">
      <BottomPanelTabsBar
        tabs={tabs}
        activeTabId={activeTabId}
        onAdd={addTab}
        onClose={closeTab}
        onActivate={activateTab}
        onPin={pinTab}
        onReorder={reorderTabs}
        onUpdate={updateTab}
      />

      <div className="tab-content">
        {activeTab ? (
          <DataTabRenderer tab={activeTab} onUpdate={updateTab} />
        ) : (
          <div className="empty">
            Brak otwartych danych
          </div>
        )}
      </div>
    </div>
  );
};
