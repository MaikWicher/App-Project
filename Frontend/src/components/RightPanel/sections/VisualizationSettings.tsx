import type { VisualizationTab } from "../../../types/visualization";

export const VisualizationSettings: React.FC<{ tab: VisualizationTab }> = () => (
  <section className="panel-section">
    <h4>🎨 Wizualizacja</h4>

    <label>
      Oś X
      <input type="text" placeholder="np. data" />
    </label>

    <label>
      Oś Y
      <input type="text" placeholder="np. sprzedaż" />
    </label>

    <label className="checkbox">
      <input type="checkbox" />
      Skumulowany
    </label>
  </section>
);
