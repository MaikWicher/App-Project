import React from "react";
import { ResponsiveRadar } from "@nivo/radar";

const data = [
  { taste: "A", chardonay: 90, merlot: 70 },
  { taste: "B", chardonay: 60, merlot: 80 },
  { taste: "C", chardonay: 75, merlot: 60 },
];

export const StarChartView: React.FC = () => (
  <div style={{ height: 300 }}>
    <ResponsiveRadar
      data={data}
      keys={["chardonay", "merlot"]}
      indexBy="taste"
      maxValue={100}
      margin={{ top: 50, right: 80, bottom: 50, left: 80 }}
    />
  </div>
);
