import React from "react";
import type { VisualizationTab } from "../../../types/visualization";
import { useTranslation } from "react-i18next";

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const AggregationTools: React.FC<Props> = ({ tab, onUpdate }) => {
  const config = tab.content as any; // Cast to any to support both ChartConfig and DuckDBConfig
  const { t } = useTranslation('common');

  if (!config || (tab.type !== "chart" && tab.type !== "duckdb")) return null;

  const handleAggregate = (type: "SUM" | "AVG" | "MIN" | "MAX") => {
    if (config.series.length < 2) {
      alert(t('properties.needTwoSeries'));
      return;
    }

    const newData = new Array(config.categories.length).fill(0).map((_, idx) => {
      const values = config.series.map((s: any) => s.data[idx] || 0); // Explicit cast
      if (type === "SUM") return values.reduce((a: number, b: number) => a + b, 0);
      if (type === "AVG") return values.reduce((a: number, b: number) => a + b, 0) / values.length;
      if (type === "MIN") return Math.min(...values);
      if (type === "MAX") return Math.max(...values);
      return 0;
    });

    const newSeries = {
      name: `${type} z ${config.series.length} serii`,
      data: newData
    };

    onUpdate(tab.id, {
      content: {
        ...config,
        series: [...config.series, newSeries]
      }
    });
  };

  return (
    <section className="panel-section">
      <h4>🧮 {t('properties.aggregationTitle')}</h4>

      <div className="button-row">
        <button onClick={() => handleAggregate("SUM")}>SUM</button>
        <button onClick={() => handleAggregate("AVG")}>AVG</button>
        <button onClick={() => handleAggregate("MIN")}>MIN</button>
        <button onClick={() => handleAggregate("MAX")}>MAX</button>
      </div>
      <p style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>
        {t('properties.aggregationFootnote')}
      </p>
    </section>
  );
};
