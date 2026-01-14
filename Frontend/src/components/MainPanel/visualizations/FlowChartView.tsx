import React from "react";
import { ResponsiveSankey } from "@nivo/sankey";

const data = {
  nodes: [{ id: "A" }, { id: "B" }, { id: "C" }],
  links: [
    { source: "A", target: "B", value: 5 },
    { source: "B", target: "C", value: 3 },
    { source: "A", target: "C", value: 2 },
  ],
};

export const FlowChartView: React.FC = () => (
  <div style={{ height: 300 }}>
    <ResponsiveSankey
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      colors={{ scheme: "category10" }}
      nodeOpacity={1}
      linkOpacity={0.5}
    />
  </div>
);
