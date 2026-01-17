import React, { useMemo } from "react";
import { ResponsiveRadar } from "@nivo/radar";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { ZoomWrapper } from "../../common/ZoomWrapper";
import { processChartData } from "../../../utils/chartDataUtils";

interface Props {
  tab: VisualizationTab;
}

export const StarChartView: React.FC<Props> = ({ tab }) => {
  const rawConfig = tab.content as ChartConfig;
  const config = useMemo(() => processChartData(rawConfig), [rawConfig]);

  const { data, keys } = useMemo(() => {
    if (!config || config.series.length === 0) return { data: [], keys: [] };

    // Format for Nivo Radar: { category: "Cat1", SeriesA: 10, SeriesB: 20, ... }
    const formattedData = config.categories.map((cat, index) => {
      const point: any = { category: cat };
      config.series.forEach(s => {
        point[s.name] = s.data[index] || 0;
      });
      return point;
    });

    return {
      data: formattedData,
      keys: config.series.map(s => s.name)
    };
  }, [config]);

  if (!config) return <div>Brak danych</div>;

  return (
    <div style={{ height: 300 }}>
      {data.length > 0 ? (
        <ZoomWrapper>
          <ResponsiveRadar
            data={data}
            keys={keys}
            indexBy="category"
            maxValue="auto"
            margin={{ top: 50, right: 80, bottom: 50, left: 80 }}
            curve="linearClosed"
            borderWidth={2}
            borderColor={{ from: "color" }}
            gridLevels={5}
            gridShape="circular"
            gridLabelOffset={36}
            enableDots={true}
            dotSize={10}
            dotColor={{ theme: "background" }}
            dotBorderWidth={2}
            dotBorderColor={{ from: "color" }}
            enableDotLabel={true}
            dotLabel="value"
            dotLabelYOffset={-12}
            colors={{ scheme: "nivo" }}
            fillOpacity={0.25}
            blendMode="multiply"
            animate={true}
            theme={{
              text: { fill: "#ddd" },
              axis: {
                ticks: { text: { fill: "#ddd" } }
              }
            }}
            legends={config.showLegend ? [
              {
                anchor: 'top-left',
                direction: 'column',
                translateX: -50,
                translateY: -40,
                itemWidth: 80,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                  {
                    on: 'hover',
                    style: {
                      itemTextColor: '#ddd'
                    }
                  }
                ]
              }
            ] : []}
          />
        </ZoomWrapper>
      ) : (
        <div style={{ padding: 20 }}>Brak danych dla wykresu radarowego</div>
      )}
    </div>
  );
};
