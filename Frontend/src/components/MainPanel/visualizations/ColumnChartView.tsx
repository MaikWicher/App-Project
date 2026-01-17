import React from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";

interface ColumnChartViewProps {
  tab: VisualizationTab;
  title?: string;
}

export const ColumnChartView: React.FC<ColumnChartViewProps> = ({ tab, title }) => {
  const config = tab.content as ChartConfig;

  if (!config) return <div>Błąd konfiguracji wykresu</div>;

  const options = {
    chart: {
      type: "bar" as const,
      height: 350,
      toolbar: { show: true },
      zoom: { enabled: true },
      animations: { enabled: true }
    },
    title: {
      text: title || tab.title,
      align: "left" as const,
    },
    xaxis: {
      categories: config.categories,
    },
    yaxis: {
      title: { text: "Wartość" },
    },
    legend: {
      show: config.showLegend
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
  };

  return <ReactApexChart options={options} series={config.series} type="bar" height={350} />;
};
