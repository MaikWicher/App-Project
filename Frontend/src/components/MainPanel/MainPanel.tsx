import { useVisualizationTabs } from "../../hooks/useVisualizationTabs";
import { TabsBar } from "./TabsBar";
import { VisualizationRenderer } from "./VisualizationRenderer";
import "./mainPanel.css";

export const MainPanel: React.FC = () => {
  const { tabs, activeTabId, addTab, closeTab, activateTab, pinTab, reorderTabs } = useVisualizationTabs();
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  return (
    <div className="main-panel">
      <TabsBar
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
          <VisualizationRenderer tab={activeTab} />
        ) : (
          <div className="empty">Brak otwartej wizualizacji</div>
        )}
      </div>
    </div>
  );
};
