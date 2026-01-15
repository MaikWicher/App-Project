import type { VisualizationTab } from "../../../types/visualization";

export const AggregationTools: React.FC<{ tab: VisualizationTab }> = () => (
  <section className="panel-section">
    <h4>🧮 Agregacja</h4>

    <div className="button-row">
      <button>Group by</button>
      <button>SUM</button>
      <button>AVG</button>
      <button>MIN</button>
      <button>MAX</button>
    </div>
  </section>
);
