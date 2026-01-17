import React from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";
import { processChartData } from "../../../utils/chartDataUtils";

interface LineChartViewProps {
  tab: VisualizationTab;
  title?: string;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ tab, title }) => {
  const rawConfig = tab.content as ChartConfig;
  const config = React.useMemo(() => processChartData(rawConfig), [rawConfig]);

  if (!config) return <div>Błąd konfiguracji wykresu</div>;

  const options = {
    chart: {
      type: "line" as const,
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
    }
  };

  return <ReactApexChart options={options} series={config.series} type="line" height={350} />;
};
