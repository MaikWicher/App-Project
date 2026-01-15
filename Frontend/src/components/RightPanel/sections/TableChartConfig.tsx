import type { VisualizationTab } from "../../../types/visualization";

export const TableChartConfig: React.FC<{ tab: VisualizationTab }> = () => (
  <section className="panel-section">
    <h4>⚙️ Konfiguracja</h4>

    <label className="checkbox">
      <input type="checkbox" />
      Pokaż legendę
    </label>

    <label className="checkbox">
      <input type="checkbox" />
      Sortowanie
    </label>
  </section>
);
