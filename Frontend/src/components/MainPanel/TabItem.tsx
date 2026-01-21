import type { VisualizationTab } from "../../types/visualization";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  tab: VisualizationTab;
  active: boolean;
  onActivate(id: string): void;
  onClose(id: string): void;
  onPin(id: string): void;
  onUpdate(id: string, changes: Partial<VisualizationTab>): void;
}

export const TabItem: React.FC<Props> = ({ tab, active, onActivate, onClose, onPin, onUpdate }) => {
  const { t } = useTranslation();
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id: tab.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  const [hover, setHover] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(tab.title);
  const tabRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditTitle(tab.title);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const saveTitle = () => {
    setIsEditing(false);
    if (editTitle.trim() && editTitle !== tab.title) {
      onUpdate(tab.id, { title: editTitle });
    } else {
      setEditTitle(tab.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(tab.title);
    }
    e.stopPropagation(); // Prevent dnd listeners
  };

  return (
    <div
      ref={el => {
        setNodeRef(el);
        tabRef.current = el!;
      }}
      style={style}
      className={`tab-item ${active ? "active" : ""}`}
      onClick={() => !isEditing && onActivate(tab.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      {...attributes}
      {...listeners}
    >
      <tab.icon />
      {isEditing ? (
        <input
          ref={inputRef}
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onBlur={saveTitle}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          onMouseDown={e => e.stopPropagation()} // Prevent drag start
          style={{
            background: '#222',
            border: '1px solid #555',
            color: 'white',
            fontSize: '12px',
            padding: '2px 4px',
            borderRadius: '2px',
            width: '100px'
          }}
        />
      ) : (
        <span className="title" onDoubleClick={startEditing}>{tab.title}</span>
      )}

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
            top: tabRef.current.offsetTop + tabRef.current.offsetHeight + 4,
            left: tabRef.current.offsetLeft,
            zIndex: 1000,
            pointerEvents: "none",
          }}
        >
          <div style={{
            display: 'inline-block',
            background: '#2d2d2d',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            boxShadow: '0 0 6px rgba(0,0,0,0.5)',
            fontSize: '12px',
            whiteSpace: 'nowrap',
          }}>
            {t('tabs.preview', { title: tab.title })}
          </div>
        </div>
      )}
    </div>
  );
};
