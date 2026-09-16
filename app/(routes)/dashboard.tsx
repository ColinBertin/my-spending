"use client";

import { useState } from "react";
import Loading from "../loading";
import { MonthlyFlow, MonthlyTransactionSummary } from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
import { formatCurrencyIntoYen, getTimeOfDayGreeting } from "@/helpers";

import StatTile from "@/components/StatTile";
import PageLayout from "@/components/ui/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import BarChart from "@/components/BarChart";

type DashboardProps = {
  monthlyTransactionSummary: MonthlyTransactionSummary;
  twelveMonthFlow: MonthlyFlow[];
};

export default function Dashboard({
  monthlyTransactionSummary,
  twelveMonthFlow,
}: DashboardProps) {
  const { user, loading } = useAuthUser();

  const barChartMonths = twelveMonthFlow.map((data) => data.label);
  const barChartIncome = twelveMonthFlow.map((data) => data.totalIncome);
  const barChartSpending = twelveMonthFlow.map((data) => data.totalSpending);

  const today = new Date();
  const month = today
    .toLocaleString("default", { month: "long" })
    .toUpperCase();
  const year = today.getFullYear();

  const monthYearOptions = Array.from({ length: 60 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      id: `${date.getFullYear()}-${date.getMonth() + 1}`,
      name: date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };
  });
  const [selectedMonthYear, setSelectedMonthYear] = useState(
    monthYearOptions[0].id,
  );

  if (loading || !user) {
    return <Loading />;
  }

  const rawUserName = user.user_metadata?.username?.trim();
  const userName = rawUserName
    ? `${rawUserName.charAt(0).toUpperCase()}${rawUserName.slice(1)}`
    : null;

  const statTiles = [
    {
      label: "Net this month",
      value: `${monthlyTransactionSummary.net >= 0 ? "+" : ""}${formatCurrencyIntoYen(monthlyTransactionSummary.net)}`,
      valueClassName:
        monthlyTransactionSummary.net >= 0
          ? "text-[#0E7C66]"
          : "text-[#B0442A]",
    },
    {
      label: "Income",
      value: formatCurrencyIntoYen(monthlyTransactionSummary.totalIncome),
    },
    {
      label: "Spending",
      value: formatCurrencyIntoYen(monthlyTransactionSummary.totalSpending),
    },
    {
      label: "Transactions",
      value: monthlyTransactionSummary.transactionCount,
    },
  ];

  const categoryBreakdown = [
    { name: "Rent", amount: 95000, percentage: 100 },
    { name: "Food", amount: 34200, percentage: 36 },
    { name: "Health", amount: 16300, percentage: 17 },
    { name: "Entertainment", amount: 14100, percentage: 15 },
    { name: "Utilities", amount: 12400, percentage: 13 },
    { name: "Transport", amount: 9800, percentage: 10 },
  ];

  return (
    <PageLayout>
      <>
        <PageHeader
          hoverTitle={
            <small>
              {month} {year} · MONTH TO DATE
            </small>
          }
          title={`${getTimeOfDayGreeting()}
            ${userName || "there"}`}
          actionButtons={[
            <select
              key={0}
              className="h-[38px] cursor-pointer rounded-[9px] border border-[#E3DFD7] bg-white px-[15px] text-[13px] font-medium text-[#3B3934] focus:border-[#17161A] focus:outline-none"
              defaultValue={selectedMonthYear}
              onChange={(e) => setSelectedMonthYear(e.target.value)}
            >
              {monthYearOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>,
          ]}
        />
        <section className="mb-5 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] sm:grid-cols-4">
          {statTiles.map((tile) => (
            <StatTile key={tile.label} {...tile} />
          ))}
        </section>
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <div className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
            <div className="flex items-baseline justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] py-[15px]">
              <h2 className="text-[14px] font-semibold">Twelve-month flow</h2>
              <span className="text-[10px] font-medium tracking-[0.12em] text-[#5C5952] uppercase">
                Income / Spending
              </span>
            </div>
            <div className="px-[18px] pt-5 pb-4">
              <BarChart
                labelSet={barChartMonths}
                datasets={[
                  {
                    label: "Income",
                    color: "#17161A",
                    data: barChartIncome,
                  },
                  {
                    label: "Spending",
                    color: "rgba(232, 85, 47, 0.35)",
                    data: barChartSpending,
                  },
                ]}
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
            <div className="border-b border-[#E3DFD7] px-[18px] py-[15px]">
              <h2 className="text-[14px] font-semibold">Where it went</h2>
            </div>
            <div className="flex flex-col gap-3 px-[18px] pt-[14px] pb-4">
              {categoryBreakdown.map((category) => (
                <div key={category.name}>
                  <div className="mb-[6px] flex justify-between gap-[10px] text-[12px] font-medium">
                    <span>{category.name}</span>
                    <span className="font-mono tabular-nums text-[#3B3934]">
                      {formatCurrencyIntoYen(category.amount)}
                    </span>
                  </div>
                  <div className="h-[6px] overflow-hidden rounded-[3px] bg-[#F1EEE8]">
                    <div
                      className="h-full rounded-[3px]"
                      style={{
                        width: `${category.percentage}%`,
                        backgroundColor:
                          category.percentage > 60 ? "#17161A" : "#E8552F",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </>
    </PageLayout>
  );
}
