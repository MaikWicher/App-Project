import React from "react";
import { ResponsivePie } from "@nivo/pie";

const data = [
  { id: "A", value: 30 },
  { id: "B", value: 80 },
  { id: "C", value: 45 },
];

export const PieChartView: React.FC = () => (
  <div style={{ height: 300 }}>
    <ResponsivePie
      data={data}
      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      innerRadius={0.4}
      padAngle={0.7}
      cornerRadius={3}
    />
  </div>
);
