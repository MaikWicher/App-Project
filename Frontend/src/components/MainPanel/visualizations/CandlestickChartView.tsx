import React from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab } from "../../../types/visualization";

interface Props {
  tab: VisualizationTab;
}

export const CandlestickChartView: React.FC<Props> = ({ tab }) => {
  const series = [
    {
      data: [
        { x: new Date(2026, 0, 1).getTime(), y: [100, 110, 90, 105] },
        { x: new Date(2026, 0, 2).getTime(), y: [105, 115, 95, 110] },
        { x: new Date(2026, 0, 3).getTime(), y: [110, 120, 100, 115] },
        { x: new Date(2026, 0, 4).getTime(), y: [115, 125, 105, 120] },
      ],
    },
  ];

  const options = {
    chart: {
      type: "candlestick" as const,
      height: 350,
      toolbar: { show: true },
      background: "#f4f4f4",
    },
    title: {
      text: tab.title,
      align: "left" as const,
    },
    xaxis: { type: "datetime" as const },
    yaxis: { tooltip: { enabled: true } },
  };

  return <ReactApexChart options={options} series={series} type="candlestick" height={350} />;
};
