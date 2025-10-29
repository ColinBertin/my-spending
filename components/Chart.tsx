"use client";

import dynamic from "next/dynamic";
import "chart.js/auto";

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
  ssr: false,
});

const LineChart = ({
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
        // label: 'Line Chart',
        data: dataSet,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div style={{ width: "300px", height: "300px" }}>
      <h1>Example 1: Line Chart</h1>
      <Line data={data} />
    </div>
  );
};
export default LineChart;
