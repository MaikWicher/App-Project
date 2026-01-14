import React from "react";
import ReactApexChart from "react-apexcharts";

interface ColumnChartViewProps {
  title?: string;
}

export const ColumnChartView: React.FC<ColumnChartViewProps> = ({ title = "Wykres kolumnowy" }) => {
  const series = [
    {
      name: "Sprzedaż",
      data: [30, 40, 25, 50, 49, 60, 70],
    },
  ];

  const options = {
    chart: {
      type: "bar" as const,
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
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
      },
    },
  };

  return <ReactApexChart options={options} series={series} type="bar" height={350} />;
};
