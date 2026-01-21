import React, { useMemo } from "react";
import { ResponsivePie } from "@nivo/pie";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { ZoomWrapper } from "../../common/ZoomWrapper";
import { processChartData } from "../../../utils/chartDataUtils";

interface Props {
  tab: VisualizationTab;
}

export const PieChartView: React.FC<Props> = ({ tab }) => {
  const rawConfig = tab.content as ChartConfig;
  const config = useMemo(() => processChartData(rawConfig), [rawConfig]);

  const data = useMemo(() => {
    if (!config || !config.series[0]) return [];

    // Convert first series + categories into Pie format { id: category, value: dataPoint }
    return config.categories.map((cat, index) => ({
      id: cat,
      label: cat,
      value: config.series[0].data[index] || 0
    }));
  }, [config]);

  if (!config) return <div>Brak danych</div>;

  return (
    <div style={{ height: '100%', minHeight: 300 }}>
      <ZoomWrapper>
        {data.length > 0 ? (
          <ResponsivePie
            data={data}
            margin={{ top: 20, right: 120, bottom: 20, left: 20 }}
            innerRadius={0.4}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            colors={{ scheme: 'nivo' }}
            borderWidth={1}
            borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
            enableArcLinkLabels={true}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#ddd"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: 'color' }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
            legends={config.showLegend ? [
              {
                anchor: 'right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
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
        ) : (
          <div style={{ padding: 20 }}>Brak danych dla wykresu kołowego</div>
        )}
      </ZoomWrapper>
    </div>
  );
};
