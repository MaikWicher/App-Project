import React from "react";
import ReactApexChart from "react-apexcharts";

interface LineChartViewProps {
  title?: string;
}

export const LineChartView: React.FC<LineChartViewProps> = ({ title = "Wykres liniowy" }) => {
  const series = [
    {
      name: "Sprzedaż",
      data: [10, 41, 35, 51, 49, 62, 69],
    },
  ];

  const options = {
    chart: {
      type: "line" as const,
      height: 350,
      toolbar: { show: true },
    },
    title: {
      text: title,
      align: "left" as const,
    },
    xaxis: {
      categories: ["Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec", "Lipiec"],
    },
    yaxis: {
      title: { text: "Wartość" },
    },
  };

  return <ReactApexChart options={options} series={series} type="line" height={350} />;
};
