// StatChartView.tsx
import React from "react";
import { BoxPlot } from "@nivo/boxplot";

interface StatChartViewProps {
  // jeśli będziesz przekazywać dane dynamicznie, możesz tu dodać props
}

const mockData = [
  { A: 10, B: 20, C: 30, D: 40, E: 50 },
  { A: 15, B: 25, C: 35, D: 45, E: 55 },
  { A: 5,  B: 15, C: 25, D: 35, E: 45 },
];

export const StatChartView: React.FC<StatChartViewProps> = () => {
  return (
    <div style={{ height: 400 }}>
      <BoxPlot
        width={600}
        height={400}
        data={mockData}                 
        layout="vertical"
        margin={{ top: 50, right: 50, bottom: 50, left: 50 }}
        colors={{ scheme: "nivo" }}
        axisBottom={{
          legend: "Kategorie",
          legendPosition: "middle",
          legendOffset: 36
        }}
        axisLeft={{
          legend: "Wartości",
          legendPosition: "middle",
          legendOffset: -40
        }}
      />
    </div>
  );
};
