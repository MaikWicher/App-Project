import type { VisualizationTab } from "../../../types/visualization";

export const GraphEditor: React.FC<{ tab: VisualizationTab }> = () => (
  <section className="panel-section">
    <h4>🧠 Graf</h4>

    <label>
      Layout
      <select>
        <option value="grid">Grid</option>
        <option value="circle">Circle</option>
        <option value="breadthfirst">Breadth-first</option>
        <option value="dagre">Dagre</option>
      </select>
    </label>

    <label className="checkbox">
      <input type="checkbox" />
      Graf skierowany
    </label>

    <div className="button-row">
      <button>➕ Węzeł</button>
      <button>➕ Krawędź</button>
    </div>
  </section>
);
