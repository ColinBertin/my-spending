"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

type BarChartDataset = {
  label: string;
  data: number[];
  color: string;
};

export default function BarChart({
  labelSet,
  datasets,
}: {
  labelSet: string[];
  datasets: BarChartDataset[];
}) {
  const data = {
    labels: labelSet,
    datasets: datasets.map((dataset) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: dataset.color,
      borderWidth: 0,
      barPercentage: 0.92,
      categoryPercentage: 0.9,
    })),
  };

  return (
    <div className="mx-auto h-[220px] w-full max-w-2xl sm:h-[250px]">
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            x: { grid: { display: false }, border: { display: false } },
            y: {
              grid: { display: false },
              border: { display: false },
              ticks: { display: false },
            },
          },
        }}
      />
    </div>
  );
}
