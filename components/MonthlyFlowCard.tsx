import { MonthlyFlow } from "@/types";
import DashboardCard from "@/components/DashboardCard";
import BarChart from "@/components/BarChart";

type MonthlyFlowCardProps = {
  twelveMonthFlow: MonthlyFlow[];
};

export default function MonthlyFlowCard({
  twelveMonthFlow,
}: MonthlyFlowCardProps) {
  return (
    <DashboardCard
      title="Twelve-month flow"
      eyebrow="Income / Spending"
      bodyClassName="px-[18px] pt-5 pb-4"
    >
      <BarChart
        labelSet={twelveMonthFlow.map((data) => data.label)}
        datasets={[
          {
            label: "Income",
            color: "#17161A",
            data: twelveMonthFlow.map((data) => data.totalIncome),
          },
          {
            label: "Spending",
            color: "rgba(232, 85, 47, 0.35)",
            data: twelveMonthFlow.map((data) => data.totalSpending),
          },
        ]}
      />
    </DashboardCard>
  );
}
