import type { DataTab } from "../../types/dataTabs";
import { BottomPanelTabsBar } from "./BottomPanelTabsBar";
import "./bottomPanel.css";
import { DataTabRenderer } from "./DataTabRenderer";
import { useTranslation } from "react-i18next";

interface Props {
  tabs: DataTab[];
  activeTabId: string | null;
  addTab: (type: any, title?: string) => void;
  closeTab: (id: string) => void;
  activateTab: (id: string) => void;
  pinTab: (id: string) => void;
  reorderTabs: (newOrder: DataTab[]) => void;
  updateTab: (id: string, changes: Partial<DataTab>) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

export const BottomPanel: React.FC<Props> = ({
  tabs,
  activeTabId,
  addTab,
  closeTab,
  activateTab,
  pinTab,
  reorderTabs,
  updateTab,
  isMaximized,
  onToggleMaximize
}) => {
  const { t } = useTranslation();
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
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
      />

      <div className="tab-content">
        {activeTab ? (
          <DataTabRenderer tab={activeTab} onUpdate={updateTab} />
        ) : (
          <div className="empty">
            {t('bottomPanel.noData')}
          </div>
        )}
      </div>
    </div>
  );
};
