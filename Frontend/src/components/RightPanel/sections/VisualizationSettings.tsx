import type { VisualizationTab, ChartType } from "../../../types/visualization";

const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: "line", label: "Liniowy" },
  { value: "bar", label: "Słupkowy (Poziomy)" },
  { value: "column", label: "Kolumnowy" },
  { value: "pie", label: "Kołowy" },
  { value: "flow", label: "Przepływu" },
  { value: "star", label: "Gwiazdowy" },
  { value: "stat", label: "Statystyczny" },
  { value: "candlestick", label: "Świecowy" },
  { value: "table", label: "Tabela Danych (Edycja)" },
];

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const VisualizationSettings: React.FC<Props> = ({ tab, onUpdate }) => {
  return (
    <section className="panel-section">
      <h4>🎨 Wizualizacja</h4>

      <label>
        Typ wykresu
        <select
          value={tab.chartType}
          onChange={(e) => onUpdate(tab.id, { chartType: e.target.value as ChartType })}
        >
          {CHART_TYPES.map(t => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </label>

      {/* Placeholder for future specific settings */}
    </section>
  );
};
