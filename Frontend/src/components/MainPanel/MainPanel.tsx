import type { VisualizationTab } from "../../types/visualization";
import type { useVisualizationTabs } from "../../hooks/useVisualizationTabs";
import { TabsBar } from "./TabsBar";
import { VisualizationRenderer } from "./VisualizationRenderer";
import "./mainPanel.css";

interface MainPanelProps {
  tabs: VisualizationTab[];
  activeTabId: string | null;
  onAdd: ReturnType<typeof useVisualizationTabs>["addTab"];
  onClose: ReturnType<typeof useVisualizationTabs>["closeTab"];
  onActivate: ReturnType<typeof useVisualizationTabs>["activateTab"];
  onPin: ReturnType<typeof useVisualizationTabs>["pinTab"];
  onReorder: ReturnType<typeof useVisualizationTabs>["reorderTabs"];
  onUpdate: ReturnType<typeof useVisualizationTabs>["updateTab"];
}

export const MainPanel: React.FC<MainPanelProps> = ({
  tabs,
  activeTabId,
  onAdd,
  onClose,
  onActivate,
  onPin,
  onReorder,
  onUpdate
}) => {
  const activeTab = tabs.find(t => t.id === activeTabId) ?? null;

  return (
    <div className="main-panel">
      <TabsBar
        tabs={tabs}
        activeTabId={activeTabId}
        onAdd={onAdd}
        onClose={onClose}
        onActivate={onActivate}
        onPin={onPin}
        onReorder={onReorder}
        onUpdate={onUpdate}
      />

      <div className="tab-content">
        {activeTab ? (
          <VisualizationRenderer tab={activeTab} onUpdate={onUpdate} onAdd={onAdd} />
        ) : (
          <div className="empty">Brak otwartej wizualizacji</div>
        )}
      </div>
    </div>
  );
};
