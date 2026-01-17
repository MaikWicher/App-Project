import React from "react";
import type { VisualizationTab, ChartConfig, GraphConfig } from "../../../types/visualization";

export const DataInspector: React.FC<{ tab: VisualizationTab }> = ({ tab }) => {
  const isChart = tab.type === "chart" && tab.content;
  const isGraph = tab.type === "graph" && tab.content;

  let recordCount = 0;
  let fieldCount = 0;
  let source = "Brak danych";
  let fields: string[] = [];

  if (isChart) {
    const data = tab.content as ChartConfig;
    // Records = Total number of data points across all series
    recordCount = data.series.reduce((acc, s) => acc + s.data.length, 0);
    // Fields = Number of series + maybe categories? Let's say Series count.
    fieldCount = data.series.length;
    fields = data.series.map(s => s.name);
    source = "Edytor Ręczny (Chart)";
  } else if (isGraph) {
    const data = tab.content as GraphConfig;
    recordCount = (data.nodes?.length || 0) + (data.edges?.length || 0);
    fieldCount = 2; // Nodes + Edges categories effectively
    fields = ["Nodes", "Edges"];
    source = "Edytor Ręczny (Graph)";
  }

  return (
    <section className="panel-section">
      <h4>🔍 Dane</h4>

      <div className="kv"><span>Źródło</span><span>{source}</span></div>
      <div className="kv"><span>Rekordy</span><span>{recordCount.toLocaleString()}</span></div>
      <div className="kv">
        <span>Pola ({fieldCount})</span>
        <span style={{ fontSize: "10px", textAlign: "right" }}>{fields.slice(0, 3).join(", ")}{fields.length > 3 ? "..." : ""}</span>
      </div>
    </section>
  );
};
