import React, { useMemo } from "react";
import { ResponsiveSankey } from "@nivo/sankey";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { ZoomWrapper } from "../../common/ZoomWrapper";

interface Props {
  tab: VisualizationTab;
}

export const FlowChartView: React.FC<Props> = ({ tab }) => {
  const config = tab.content as ChartConfig;

  const data = useMemo(() => {
    if (!config || config.series.length === 0) return { nodes: [], links: [] };

    // Adapter: Create a simple flow from Categories -> Series
    // Nodes: Categories + Series Names
    // Links: Category -> Series with value

    const nodes = [
      ...config.categories.map(c => ({ id: c })),
      ...config.series.map(s => ({ id: s.name }))
    ];

    const links: { source: string; target: string; value: number }[] = [];

    config.categories.forEach((cat, catIdx) => {
      config.series.forEach(series => {
        const val = series.data[catIdx];
        if (val && val > 0) {
          links.push({
            source: cat,
            target: series.name,
            value: val
          });
        }
      });
    });

    // Remove duplicates
    const uniqueNodes = Array.from(new Set(nodes.map(n => n.id))).map(id => ({ id }));

    return { nodes: uniqueNodes, links };
  }, [config]);

  if (!config) return <div>Brak danych</div>;

  return (
    <div style={{ height: 300 }}>
      {data.nodes.length > 0 ? (
        <ZoomWrapper>
          <ResponsiveSankey
            data={data}
            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            align="justify"
            colors={{ scheme: "category10" }}
            nodeOpacity={1}
            nodeThickness={18}
            nodeInnerPadding={3}
            nodeSpacing={24}
            nodeBorderWidth={0}
            nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
            linkOpacity={0.5}
            linkHoverOthersOpacity={0.1}
            enableLinkGradient={true}
            labelPosition="outside"
            labelOrientation="vertical"
            labelPadding={16}
            labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
            theme={{
              text: { fill: "#ddd" }
            } as any}
          />
        </ZoomWrapper>
      ) : (
        <div style={{ padding: 20 }}>Brak danych dla wykresu przepływu</div>
      )}
    </div>
  );
};
