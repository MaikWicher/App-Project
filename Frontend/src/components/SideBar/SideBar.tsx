import React from "react";
import { FaFolder, FaSearch, FaSlidersH, FaChartBar, FaCog, FaHistory } from "react-icons/fa";
import { SideBarButton } from "./SideBarButton";
import type { SideBarSectionType } from "../../types/sideBar";
import { ExplorerSection } from "./ExplorerSection";
import "./sideBar.css";
import { useTranslation } from "react-i18next";

interface SideBarProps {
  pinned: boolean;
  onTogglePinned: () => void;
  onOpenTable: (tableName: string) => void;
  onTableDeleted: (tableName: string) => void;
}

export const SideBar: React.FC<SideBarProps> = ({ pinned, onTogglePinned, onOpenTable, onTableDeleted }) => {
  const [activeSection, setActiveSection] = React.useState<SideBarSectionType | null>(null);
  const [lastActiveSection, setLastActiveSection] = React.useState<SideBarSectionType | null>(null);
  const { t } = useTranslation('common');

  const toggleSection = (section: SideBarSectionType) => {
    if (activeSection === section) {
      setActiveSection(null);
    } else {
      setActiveSection(section);
      setLastActiveSection(section);
    }
  };

  const sections = [
    { id: "explorer", title: t('sidebar.explorer'), icon: FaFolder },
    { id: "search", title: t('sidebar.search'), icon: FaSearch },
    { id: "filters", title: t('sidebar.filters'), icon: FaSlidersH },
    { id: "analytics", title: t('sidebar.analytics'), icon: FaChartBar },
    { id: "settings", title: t('sidebar.settings'), icon: FaCog },
    { id: "history", title: t('sidebar.history'), icon: FaHistory }
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
    <div className={`sidebar ${pinned ? "pinned" : ""} ${activeSection ? "active" : ""}`} style={{ width: (pinned || activeSection) ? 250 : 48 }}>
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
            {activeSection === 'explorer' ? (
              <ExplorerSection onOpenTable={onOpenTable} onTableDeleted={onTableDeleted} />
            ) : (
              <p>{t('sidebar.sectionContent', { section: activeSection })}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
