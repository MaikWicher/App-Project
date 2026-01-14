import { useState } from "react";
import type { SideBarSectionType } from "../types/sideBar";

export const useSideBar = () => {
  const [activeSection, setActiveSection] = useState<SideBarSectionType | null>(null);
  const [pinned, setPinned] = useState(false);

  const toggleSection = (section: SideBarSectionType) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  const togglePinned = () => {
    setPinned(prev => !prev);
  };

  return {
    activeSection,
    pinned,
    toggleSection,
    togglePinned
  };
};
