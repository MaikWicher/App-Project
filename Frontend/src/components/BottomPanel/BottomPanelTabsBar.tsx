import type { DataTab } from "../../types/dataTabs";
import { DataTabItem } from "./DataTabItem";
import "./bottomPanel.css";

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
}

export const BottomPanelTabsBar: React.FC<Props> = ({
  tabs,
  activeTabId,
  onAdd,
  onClose,
  onActivate,
  onPin,
  onReorder
}) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    const oldIndex = tabs.findIndex(t => t.id === active.id);
    const newIndex = tabs.findIndex(t => t.id === over.id);

    onReorder(arrayMove(tabs, oldIndex, newIndex));
  };

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
            />
          ))}

          <button className="tab-add" onClick={() => onAdd("table")}>+</button>
        </div>
      </SortableContext>
    </DndContext>
  );
};
