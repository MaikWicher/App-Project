import React from "react";
import { FaFolder, FaSearch, FaSlidersH, FaChartBar, FaCog, FaHistory } from "react-icons/fa";
import { SideBarButton } from "./SideBarButton";
import type { SideBarSectionType } from "../../types/sideBar";
import "./sideBar.css";

interface SideBarProps {
  pinned: boolean;
  onTogglePinned: () => void;
}

export const SideBar: React.FC<SideBarProps> = ({ pinned, onTogglePinned }) => {
  const [activeSection, setActiveSection] = React.useState<SideBarSectionType | null>(null);
  const [lastActiveSection, setLastActiveSection] = React.useState<SideBarSectionType | null>(null);

  const toggleSection = (section: SideBarSectionType) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      setLastActiveSection(section);
    }
  };

  const sections = [
    { id: "explorer", title: "Odkrywca", icon: FaFolder },
    { id: "search", title: "Wyszukiwanie", icon: FaSearch },
    { id: "filters", title: "Filtry", icon: FaSlidersH },
    { id: "analytics", title: "Analiza", icon: FaChartBar },
    { id: "settings", title: "Ustawienia", icon: FaCog },
    { id: "history", title: "Historia", icon: FaHistory }
  ] as const;

  const handleTogglePin = () => {
    if (pinned) {
      onTogglePinned();
      setActiveSection(null);
    } else {
      onTogglePinned();
      if (lastActiveSection) setActiveSection(lastActiveSection);
    }
  };

  return (
    <div className={`sidebar ${pinned ? "pinned" : ""}`}>
      {sections.map(sec => (
        <SideBarButton
          key={sec.id}
          icon={sec.icon}
          active={activeSection === sec.id}
          onClick={() => toggleSection(sec.id)}
          tooltip={sec.title}
        />
      ))}

      <div className="sidebar-footer">
        <button onClick={handleTogglePin}>{pinned ? "📌" : "📍"}</button>
      </div>

      {activeSection && (
        <div className="sidebar-panel">
          <h3>{sections.find(s => s.id === activeSection)?.title}</h3>
          <div className="sidebar-content">
            <p>Treść sekcji: {activeSection}</p>
          </div>
        </div>
      )}
    </div>
  );
};
