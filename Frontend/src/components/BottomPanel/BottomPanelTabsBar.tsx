import React from "react";
import type { DataTab } from "../../types/dataTabs";
import { DataTabItem } from "./DataTabItem";
import "./bottomPanel.css";
import {
  FaTable,
  FaFileAlt,
  FaChartBar,
  FaDatabase,
  FaHistory
} from "react-icons/fa";

import { DndContext, PointerSensor, closestCenter } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { useSensor, useSensors } from "@dnd-kit/core";

interface Props {
  tabs: DataTab[];
  activeTabId: string | null;
  onAdd(type: DataTab["type"]): void;
  onClose(id: string): void;
  onActivate(id: string): void;
  onPin(id: string): void;
  onReorder(tabs: DataTab[]): void;
  onUpdate(id: string, changes: Partial<DataTab>): void;
}

export const BottomPanelTabsBar: React.FC<Props> = ({
  tabs,
  activeTabId,
  onAdd,
  onClose,
  onActivate,
  onPin,
  onReorder,
  onUpdate
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const [showMenu, setShowMenu] = React.useState(false);

  const handleAdd = (type: DataTab["type"]) => {
    onAdd(type);
    setShowMenu(false);
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = tabs.findIndex(t => t.id === active.id);
    const newIndex = tabs.findIndex(t => t.id === over.id);
    onReorder(arrayMove(tabs, oldIndex, newIndex));
  };

  const MenuItem = ({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) => (
    <div className="tab-add-menu-item" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <Icon style={{ fontSize: 14 }} />
      <span>{label}</span>
    </div>
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={tabs.map(t => t.id)} strategy={horizontalListSortingStrategy}>
        <div className="bottom-tabs-bar">

          {tabs.map(tab => (
            <DataTabItem
              key={tab.id}
              tab={tab}
              active={tab.id === activeTabId}
              onActivate={onActivate}
              onClose={onClose}
              onPin={onPin}
              onUpdate={onUpdate}
            />
          ))}

          <div className="tab-add-container">
            <button className="tab-add" onClick={() => setShowMenu(!showMenu)}>+</button>
            {showMenu && (
              <>
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={() => setShowMenu(false)} />
                <div className="tab-add-menu" style={{ top: '100%', bottom: 'auto', marginTop: 4 }}>
                  <MenuItem icon={FaTable} label="Tabela Danych" onClick={() => handleAdd("table")} />
                  <MenuItem icon={FaFileAlt} label="Logi Systemowe" onClick={() => handleAdd("log")} />
                  <MenuItem icon={FaChartBar} label="Statystyki" onClick={() => handleAdd("stats")} />
                  <MenuItem icon={FaDatabase} label="SQL Query" onClick={() => handleAdd("query")} />
                  <MenuItem icon={FaHistory} label="Historia" onClick={() => handleAdd("history")} />
                </div>
              </>
            )}
          </div>

        </div>
      </SortableContext>
    </DndContext>
  );
};
