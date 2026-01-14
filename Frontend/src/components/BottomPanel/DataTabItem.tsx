import type { DataTab } from "../../types/dataTabs";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef } from "react";

interface Props {
  tab: DataTab;
  active: boolean;
  onActivate(id: string): void;
  onClose(id: string): void;
  onPin(id: string): void;
}

export const DataTabItem: React.FC<Props> = ({
  tab,
  active,
  onActivate,
  onClose,
  onPin
}) => {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: tab.id });

  const [hover, setHover] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div
      ref={el => {
        setNodeRef(el);
        tabRef.current = el!;
      }}
      style={style}
      className={`tab-item ${active ? "active" : ""}`}
      onClick={() => onActivate(tab.id)}
      {...attributes}
      {...listeners}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <tab.icon />
      <span className="title">{tab.title}</span>

      <button
        className="pin"
        onClick={e => {
          e.stopPropagation();
          onPin(tab.id);
        }}
      >
        {tab.isPinned ? "📍" : "📌"}
      </button>

      {tab.isClosable && !tab.isPinned && (
        <button
          className="close"
          onClick={e => {
            e.stopPropagation();
            onClose(tab.id);
          }}
        >
          ×
        </button>
      )}

      {hover && tabRef.current && (
      <div
       className="tab-tooltip"
        style={{
         position: "absolute",
         top: tabRef.current.offsetTop,
         left: tabRef.current.offsetLeft + tabRef.current.offsetWidth + 8, 
         zIndex: 1000,
         pointerEvents: "none",
       }}
      >
        <div style={{
          display: "inline-block",     
          background: '#2d2d2d',
         color: '#fff',
         padding: '4px 8px',
         borderRadius: '4px',
          boxShadow: '0 0 6px rgba(0,0,0,0.5)',
          fontSize: '12px',
          whiteSpace: 'nowrap',      
       }}>
          Podgląd: {tab.title}
        </div>
      </div>
    )}
    </div>
  );
};
