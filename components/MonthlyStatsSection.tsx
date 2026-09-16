import { MonthlyTransactionSummary } from "@/types";
import { formatCurrencyIntoYen } from "@/helpers";
import StatTile from "@/components/StatTile";
import StatTileSkeleton from "@/components/StatTileSkeleton";

type MonthlyStatsSectionProps = {
  summary: MonthlyTransactionSummary;
  isLoading: boolean;
};

export default function MonthlyStatsSection({
  summary,
  isLoading,
}: MonthlyStatsSectionProps) {
  const statTiles = [
    {
      label: "Net this month",
      value:
        summary.net === 0
          ? formatCurrencyIntoYen(summary.net)
          : `${summary.net > 0 ? "+" : ""}${formatCurrencyIntoYen(summary.net)}`,
      valueClassName:
        summary.net === 0
          ? "text-[#17161A]"
          : summary.net > 0
            ? "text-[#0E7C66]"
            : "text-[#B0442A]",
    },
    {
      label: "Income",
      value: formatCurrencyIntoYen(summary.totalIncome),
    },
    {
      label: "Spending",
      value: formatCurrencyIntoYen(summary.totalSpending),
    },
    {
      label: "Transactions",
      value: summary.transactionCount,
    },
  ];

  return (
    <section className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] sm:grid-cols-4">
      {isLoading
        ? statTiles.map((tile) => <StatTileSkeleton key={tile.label} />)
        : statTiles.map((tile) => <StatTile key={tile.label} {...tile} />)}
    </section>
  );
}
