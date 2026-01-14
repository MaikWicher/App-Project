import type { VisualizationTab } from "../../../types/visualization";

export const ComparisonView: React.FC<{ tab: VisualizationTab }> = ({ tab }) => (
  <div className="viz-placeholder">
    🔍 Porównanie: <strong>{tab.title}</strong>
  </div>
);
