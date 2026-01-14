import { useDataTabs } from "../../hooks/useDataTabs";
import { BottomPanelTabsBar } from "./BottomPanelTabsBar";
import "./bottomPanel.css";
import { DataTabRenderer } from "./DataTabRenderer";

export const BottomPanel = () => {
  const {
    tabs,
    activeTabId,
    addTab,
    closeTab,
    activateTab,
    pinTab,
    reorderTabs
  } = useDataTabs();

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
      />

      <div className="tab-content">
        {activeTab ? (
          <DataTabRenderer tab={activeTab} />
        ) : (
          <div className="empty">
            Brak otwartych danych
          </div>
        )}
      </div>
    </div>
  );
};
