import React from "react";
import type { VisualizationTab } from "../../types/visualization";
import type { useVisualizationTabs } from "../../hooks/useVisualizationTabs";
import { TabsBar } from "./TabsBar";
import { VisualizationRenderer } from "./VisualizationRenderer";
import "./mainPanel.css";
import { useTranslation } from "react-i18next";

interface MainPanelProps {
  tabs: VisualizationTab[];
  activeTabId: string | null;
  onAdd: ReturnType<typeof useVisualizationTabs>["addTab"];
  onClose: ReturnType<typeof useVisualizationTabs>["closeTab"];
  onActivate: ReturnType<typeof useVisualizationTabs>["activateTab"];
  onPin: ReturnType<typeof useVisualizationTabs>["pinTab"];
  onReorder: ReturnType<typeof useVisualizationTabs>["reorderTabs"];
  onUpdate: ReturnType<typeof useVisualizationTabs>["updateTab"];
  isMaximized?: boolean; // Optional to not break tests/legacy usages if any
  onToggleMaximize?: () => void;
}

export const MainPanel: React.FC<MainPanelProps> = ({
  tabs,
  activeTabId,
  onAdd,
  onClose,
  onActivate,
  onPin,
  onReorder,
  onUpdate,
  isMaximized,
  onToggleMaximize
}) => {
  const { t } = useTranslation('common');
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
        isMaximized={isMaximized}
        onToggleMaximize={onToggleMaximize}
      />

      <div className="tab-content">
        {activeTab ? (
          <VisualizationRenderer
            tab={activeTab}
            onUpdate={onUpdate}
            onAdd={onAdd}
            isMaximized={isMaximized}
            onToggleMaximize={onToggleMaximize}
          />
        ) : (
          <div className="empty">{t('mainPanel.noVisualization')}</div>
        )}
      </div>
    </div>
  );
};
