"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";

const Bar = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
});

const BarChart = ({
  labelSet,
  dataSet,
  datasetLabel = "Transactions",
}: {
  labelSet: string[];
  dataSet: number[];
  datasetLabel?: string;
}) => {
  const data = {
    labels: labelSet,
    datasets: [
      {
        label: datasetLabel,
        data: dataSet,
        backgroundColor: "rgba(54, 162, 235, 0.25)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl h-72 sm:h-80">
      <Bar
        data={data}
        options={{
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                autoSkip: true,
                maxTicksLimit: 10,
              },
            },
            y: {
              beginAtZero: true,
            },
          },
        }}
      />
    </div>
  );
};
export default BarChart;
