import type { VisualizationTab, ChartType } from "../../../types/visualization";
import { useTranslation } from "react-i18next";

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const VisualizationSettings: React.FC<Props> = ({ tab, onUpdate }) => {
  const { t } = useTranslation('common');

  const CHART_TYPES: { value: ChartType; label: string }[] = [
    { value: "line", label: t('chartTypes.line') },
    { value: "bar", label: t('chartTypes.bar') },
    { value: "column", label: t('chartTypes.column') },
    { value: "pie", label: t('chartTypes.pie') },
    { value: "flow", label: t('chartTypes.flow') },
    { value: "star", label: t('chartTypes.star') },
    { value: "stat", label: t('chartTypes.stat') },
    { value: "candlestick", label: t('chartTypes.candlestick') },
    { value: "table", label: t('chartTypes.table') },
  ];

  return (
    <section className="panel-section">
      <h4>🎨 {t('properties.visualizationTitle')}</h4>

      <label>
        {t('properties.chartType')}
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
