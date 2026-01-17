import React from "react";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";

interface Props {
  tab: VisualizationTab;
  onUpdate: (id: string, changes: Partial<VisualizationTab>) => void;
}

export const AggregationTools: React.FC<Props> = ({ tab, onUpdate }) => {
  const config = tab.content as ChartConfig | null;

  if (!config || tab.type !== "chart") return null;

  const handleAggregate = (type: "SUM" | "AVG" | "MIN" | "MAX") => {
    if (config.series.length < 2) {
      alert("Potrzebujesz co najmniej 2 serii do agregacji!");
      return;
    }

    const newData = new Array(config.categories.length).fill(0).map((_, idx) => {
      const values = config.series.map(s => s.data[idx] || 0);
      if (type === "SUM") return values.reduce((a, b) => a + b, 0);
      if (type === "AVG") return values.reduce((a, b) => a + b, 0) / values.length;
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
      <h4>🧮 Agregacja (Stwórz nową serię)</h4>

      <div className="button-row">
        <button onClick={() => handleAggregate("SUM")}>SUM</button>
        <button onClick={() => handleAggregate("AVG")}>AVG</button>
        <button onClick={() => handleAggregate("MIN")}>MIN</button>
        <button onClick={() => handleAggregate("MAX")}>MAX</button>
      </div>
      <p style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>
        * Tworzy nową serię na podstawie operacji na pozostałych.
      </p>
    </section>
  );
};
