import type { VisualizationTab } from "../../../types/visualization";

export const GraphView: React.FC<{ tab: VisualizationTab }> = ({ tab }) => (
  <div className="viz-placeholder">
    🧠 Graf: <strong>{tab.title}</strong>
  </div>
);
