import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import type { VisualizationTab, ChartConfig } from "../../../types/visualization";

interface Props {
  tab: VisualizationTab;
}

export const CandlestickChartView: React.FC<Props> = ({ tab }) => {
  const config = tab.content as ChartConfig;

  // Adapter: Convert single value -> OHLC Series
  const series = useMemo(() => {
    if (!config || config.series.length === 0) return [];

    return config.series.map(s => ({
      name: s.name,
      // We map categories to mock dates if possible, or just index dependent dates
      data: s.data.map((val, idx) => {
        // Generating pseudo-OHLC data based on single value
        // Open: val * 0.9, High: val * 1.1, Low: val * 0.8, Close: val
        const open = Math.floor(val * 0.95);
        const high = Math.floor(val * 1.1);
        const low = Math.floor(val * 0.85);
        const close = val;

        // Mock date: Today + index days
        const date = new Date();
        date.setDate(date.getDate() + idx);

        return {
          x: date,
          y: [open, high, low, close]
        };
      })
    }));
  }, [config]);

  if (!config) return <div>Błąd konfiguracji wykresu</div>;

  const options = {
    chart: {
      type: "candlestick" as const,
      height: 350,
      toolbar: { show: true },
      background: "transparent",
      animations: { enabled: true }
    },
    title: {
      text: tab.title,
      align: "left" as const,
      style: { color: "#ddd" }
    },
    xaxis: {
      type: "datetime" as const,
      labels: { style: { colors: "#ddd" } }
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { style: { colors: "#ddd" } }
    },
    theme: { mode: "dark" as const }
  };

  return <ReactApexChart options={options} series={series} type="candlestick" height={350} />;
};
