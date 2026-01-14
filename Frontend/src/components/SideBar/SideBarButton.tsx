import { useState, useRef, useEffect } from "react";
import type { IconType } from "react-icons";

interface Props {
  icon: IconType;
  active: boolean;
  onClick(): void;
  tooltip?: string;
}

export const SideBarButton: React.FC<Props> = ({ icon: Icon, active, onClick, tooltip }) => {
  const [hover, setHover] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hover && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + window.scrollY,
        left: rect.right + 8,
      });
    }
  }, [hover]);

  return (
    <div
      ref={ref}
      className={`sidebar-button ${active ? "active" : ""}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative" }}
    >
      <Icon size={24} />

      {hover && tooltip && (
        <div
          className="sidebar-tooltip"
          style={{
            position: "absolute",
            top: tooltipPos.top - (ref.current?.offsetTop ?? 0), 
            left: tooltipPos.left - (ref.current?.offsetLeft ?? 0),
            background: "#2d2d2d",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            whiteSpace: "nowrap",
            boxShadow: "0 0 6px rgba(0,0,0,0.5)",
            zIndex: 1000,
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  );
};
