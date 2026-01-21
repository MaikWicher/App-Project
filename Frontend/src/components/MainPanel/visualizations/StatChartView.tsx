import React, { useMemo } from "react";
import { ResponsiveBoxPlot } from "@nivo/boxplot";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { ZoomWrapper } from "../../common/ZoomWrapper";

interface Props {
  tab: VisualizationTab;
}

export const StatChartView: React.FC<Props> = ({ tab }) => {
  const config = tab.content as ChartConfig;

  // Transform ChartConfig data to Nivo BoxPlot data
  // ... (keep the same logic)
  const data = useMemo(() => {
    if (!config || config.series.length === 0) return [];

    const result: { group: string; value: number }[] = [];

    config.series.forEach(s => {
      s.data.forEach(val => {
        result.push({ group: s.name, value: val });
      });
    });

    return result;
  }, [config]);

  if (!config) return <div>Brak danych</div>;

  return (
    <div style={{ height: '100%', minHeight: 400 }}>
      <ZoomWrapper>
        <ResponsiveBoxPlot
          data={data}
          layout="horizontal" // Better fit for screen
          margin={{ top: 50, right: 50, bottom: 50, left: 100 }}
          colors={{ scheme: "nivo" }}
          enableGridX={true}
          axisBottom={{
            legend: "Wartości",
          }}
          axisLeft={{
            legend: "Seria",
            legendPosition: "middle",
            legendOffset: -60
          }}
          theme={{
            text: { fill: "#ddd" },
            axis: {
              ticks: { text: { fill: "#ddd" } },
              legend: { text: { fill: "#ddd" } }
            }
          } as any}
        />
      </ZoomWrapper>
    </div>
  );
};
