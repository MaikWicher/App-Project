import type { VisualizationTab } from "../../../types/visualization";

export const DashboardView: React.FC<{ tab: VisualizationTab }> = ({ tab }) => (
  <div className="viz-placeholder">
    📈 Dashboard: <strong>{tab.title}</strong>
  </div>
);
