"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

const LineChart = ({
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
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl h-72 sm:h-80">
      <Line
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
export default LineChart;
