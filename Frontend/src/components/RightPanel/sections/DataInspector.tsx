import type { VisualizationTab } from "../../../types/visualization";

export const DataInspector: React.FC<{ tab: VisualizationTab }> = () => (
  <section className="panel-section">
    <h4>🔍 Dane</h4>

    <div className="kv"><span>Źródło</span><span>Mock / API</span></div>
    <div className="kv"><span>Rekordy</span><span>12 340</span></div>
    <div className="kv"><span>Pola</span><span>8</span></div>
  </section>
);
