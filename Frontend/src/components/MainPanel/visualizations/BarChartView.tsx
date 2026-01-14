import React from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab } from "../../../types/visualization";

interface Props {
  tab: VisualizationTab;
}

export const BarChartView: React.FC<Props> = ({ tab }) => {
  const series = [
    {
      name: "Wartości",
      data: [10, 20, 15, 30, 25],
    },
  ];

  const options = {
    chart: {
      type: "bar" as const,
      height: 300,
      toolbar: { show: true },
    },
    title: {
      text: tab.title,
      align: "left" as const,
    },
    xaxis: {
      categories: ["A", "B", "C", "D", "E"],
    },
    yaxis: {
      title: { text: "Wartość" },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={300} />;
};
