import type { VisualizationTab, VisualizationType, ChartType } from "../../types/visualization";
import { TabItem } from "./TabItem";
import "./mainPanel.css";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import type { DragEndEvent } from "@dnd-kit/core";
import React, { useState, useRef, useEffect } from "react";
import { FaChartLine, FaProjectDiagram, FaTachometerAlt, FaColumns } from "react-icons/fa";

interface Props {
  tabs: VisualizationTab[];
  activeTabId: string | null;
  onAdd(type: VisualizationType, chartType?: ChartType): void;
  onClose(id: string): void;
  onActivate(id: string): void;
  onPin(id: string): void;
  onReorder(tabs: VisualizationTab[]): void;
}

const chartTypes: { label: string; value: ChartType }[] = [
  { label: "Wykres liniowy", value: "line" },
  { label: "Wykres słupkowy", value: "bar" },
  { label: "Wykres kolumnowy", value: "column" },
  { label: "Wykres kołowy", value: "pie" },
  { label: "Wykres przepływowy", value: "flow" },
  { label: "Wykres gwiazdowy", value: "star" },
  { label: "Wykres statystyczny", value: "stat" },
  { label: "Wykres giełdowy", value: "candlestick" }
];

export const TabsBar: React.FC<Props> = ({ tabs, activeTabId, onAdd, onClose, onActivate, onPin, onReorder }) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [showMenu, setShowMenu] = useState(false);
  const [hoverChart, setHoverChart] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
        <div className="tabs-bar">
          {tabs.map(tab => (
            <TabItem
              key={tab.id}
              tab={tab}
              active={tab.id === activeTabId}
              onActivate={onActivate}
              onClose={onClose}
              onPin={onPin}
            />
          ))}

          <div className="tab-add-container" ref={menuRef}>
            <button className="tab-add" onClick={() => setShowMenu(v => !v)}>+</button>

            {showMenu && (
              <div className="tab-add-menu">
                <div
                  className="tab-add-menu-item"
                  onMouseEnter={() => setHoverChart(true)}
                  onMouseLeave={() => setHoverChart(false)}
                >
                  <FaChartLine style={{ marginRight: 8 }} />
                  Wykres
                  {hoverChart && (
                    <div className="tab-add-submenu" style={{ position: 'absolute', left: '100%', top: 0 }}>
                      {chartTypes.map(ct => (
                        <div key={ct.value} className="tab-add-menu-item" onClick={() => { onAdd("chart", ct.value); setShowMenu(false); setHoverChart(false); }}>
                          {ct.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="tab-add-menu-item" onClick={() => { onAdd("graph"); setShowMenu(false); }}>
                  <FaProjectDiagram style={{ marginRight: 8 }} /> Graf
                </div>

                <div className="tab-add-menu-item" onClick={() => { onAdd("dashboard"); setShowMenu(false); }}>
                  <FaTachometerAlt style={{ marginRight: 8 }} /> Dashboard
                </div>

                <div className="tab-add-menu-item" onClick={() => { onAdd("comparison"); setShowMenu(false); }}>
                  <FaColumns style={{ marginRight: 8 }} /> Widok porównawczy
                </div>
              </div>
            )}
          </div>
        </div>
      </SortableContext>
    </DndContext>
  );
};
