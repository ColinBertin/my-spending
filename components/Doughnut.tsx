"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";

const Doughnut = dynamic(
  () => import("react-chartjs-2").then((mod) => mod.Doughnut),
  {
    ssr: false,
  },
);

const DoughnutChart = ({
  labelSet,
  dataSet,
}: {
  labelSet: string[];
  dataSet: number[];
}) => {
  const data = {
    labels: labelSet,
    datasets: [
      {
        data: dataSet,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        // borderColor: [
        //   "rgba(255, 99, 132, 1)",
        //   "rgba(54, 162, 235, 1)",
        //   "rgba(255, 206, 86, 1)",
        //   "rgba(75, 192, 192, 1)",
        //   "rgba(153, 102, 255, 1)",
        //   "rgba(255, 159, 64, 1)",
        // ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="w-[220px] h-[220px] sm:w-[250px] sm:h-[250px] mx-auto">
      <Doughnut data={data} options={{ maintainAspectRatio: false }} />
    </div>
  );
};

export default DoughnutChart;
