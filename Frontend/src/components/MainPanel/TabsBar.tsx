import type { VisualizationTab, VisualizationType, ChartType } from "../../types/visualization";
import { TabItem } from "./TabItem";
import "./mainPanel.css";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import React, { useState, useRef, useEffect } from "react";
import { FaChartLine, FaProjectDiagram, FaTachometerAlt, FaColumns, FaWindowMaximize, FaWindowRestore } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface Props {
  tabs: VisualizationTab[];
  activeTabId: string | null;
  onAdd(type: VisualizationType, chartType?: ChartType, initData?: any): void;
  onClose(id: string): void;
  onActivate(id: string): void;
  onPin(id: string): void;
  onReorder(tabs: VisualizationTab[]): void;
  onUpdate(id: string, changes: Partial<VisualizationTab>): void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}



export const TabsBar: React.FC<Props> = ({ tabs, activeTabId, onAdd, onClose, onActivate, onPin, onReorder, onUpdate, isMaximized, onToggleMaximize }) => {
  const { t } = useTranslation();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [showMenu, setShowMenu] = useState(false);
  const [hoverChart, setHoverChart] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const chartTypes: { label: string; value: ChartType }[] = [
    { label: t("chartTypes.line"), value: "line" },
    { label: t("chartTypes.bar"), value: "bar" },
    { label: t("chartTypes.column"), value: "column" },
    { label: t("chartTypes.pie"), value: "pie" },
    { label: t("chartTypes.flow"), value: "flow" },
    { label: t("chartTypes.star"), value: "star" },
    { label: t("chartTypes.stat"), value: "stat" },
    { label: t("chartTypes.candlestick"), value: "candlestick" }
  ];

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tabs.findIndex(t => t.id === active.id);
    const newIndex = tabs.findIndex(t => t.id === over.id);
    onReorder(arrayMove(tabs, oldIndex, newIndex));
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setHoverChart(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Determine current context (tableName)
  const activeTab = tabs.find(t => t.id === activeTabId);
  const currentTableName = (activeTab?.content as any)?.tableName;

  const handleAdd = (type: VisualizationType, chartType?: ChartType) => {
    onAdd(type, chartType, currentTableName ? { tableName: currentTableName } : undefined);
    setShowMenu(false);
    setHoverChart(false);
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
        <div className="tabs-bar" onDoubleClick={(e) => {
          if (e.target === e.currentTarget && onToggleMaximize) onToggleMaximize();
        }}>
          {tabs.map(tab => (
            <TabItem
              key={tab.id}
              tab={tab}
              active={tab.id === activeTabId}
              onActivate={onActivate}
              onClose={onClose}
              onPin={onPin}
              onUpdate={onUpdate}
            />
          ))}

          <div className="tab-add-container" ref={menuRef} style={{ display: 'flex', alignItems: 'center' }}>
            <button className="tab-add" onClick={() => setShowMenu(v => !v)}>+</button>

            {onToggleMaximize && (
              <button
                className="tab-add"
                onClick={onToggleMaximize}
                title={isMaximized ? t("visualizationMenu.restore") : t("visualizationMenu.maximize")}
                style={{ marginLeft: 4, minWidth: 24, padding: 0 }}
              >
                {isMaximized ? <FaWindowRestore size={10} /> : <FaWindowMaximize size={10} />}
              </button>
            )}

            {showMenu && (
              <div className="tab-add-menu">
                <div
                  className="tab-add-menu-item"
                  onMouseEnter={() => setHoverChart(true)}
                  onMouseLeave={() => setHoverChart(false)}
                >
                  <FaChartLine style={{ marginRight: 8 }} />
                  {t("visualizationMenu.chart")}
                  {hoverChart && (
                    <div className="tab-add-submenu" style={{ position: 'absolute', left: '100%', top: 0 }}>
                      {chartTypes.map(ct => (
                        <div key={ct.value} className="tab-add-menu-item" onClick={() => handleAdd("chart", ct.value)}>
                          {ct.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="tab-add-menu-item" onClick={() => handleAdd("graph")}>
                  <FaProjectDiagram style={{ marginRight: 8 }} /> {t("visualizationMenu.graph")}
                </div>

                <div className="tab-add-menu-item" onClick={() => handleAdd("dashboard")}>
                  <FaTachometerAlt style={{ marginRight: 8 }} /> {t("visualizationMenu.dashboard")}
                </div>

                <div className="tab-add-menu-item" onClick={() => handleAdd("comparison")}>
                  <FaColumns style={{ marginRight: 8 }} /> {t("visualizationMenu.comparison")}
                </div>
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};
