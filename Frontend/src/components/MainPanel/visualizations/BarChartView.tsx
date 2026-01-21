import React from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { processChartData } from "../../../utils/chartDataUtils";

interface Props {
  tab: VisualizationTab;
}

export const BarChartView: React.FC<Props> = ({ tab }) => {
  const rawConfig = tab.content as ChartConfig;
  const config = React.useMemo(() => processChartData(rawConfig), [rawConfig]);

  if (!config) return <div>Błąd konfiguracji wykresu</div>;

  const series = config.series;

  const options = {
    chart: {
      type: "bar" as const,
      height: 300,
      toolbar: { show: true },
      zoom: { enabled: true },
      animations: { enabled: true }
    },
    title: {
      text: tab.title,
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
        horizontal: true,
        columnWidth: "50%",
      },
    },
  };

  return <div style={{ height: '100%', width: '100%' }}><ReactApexChart options={options} series={series} type="bar" height="100%" /></div>;
};
