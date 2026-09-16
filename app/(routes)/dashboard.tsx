"use client";

import { useState } from "react";
import Loading from "../loading";
import {
  AccountMonthlySummary,
  MonthlyFlow,
  MonthlyTransactionSummary,
  RecentActivityItem,
} from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
import { getTimeOfDayGreeting } from "@/helpers";

import MonthYearSelect from "@/components/MonthYearSelect";
import MonthlyStatsSection from "@/components/MonthlyStatsSection";
import MonthlyFlowCard from "@/components/MonthlyFlowCard";
import CategoryBreakdownCard from "@/components/CategoryBreakdownCard";
import AccountsOverviewSection from "@/components/AccountsOverviewSection";
import RecentActivityCard from "@/components/RecentActivityCard";
import PageLayout from "@/components/ui/PageLayout";
import PageHeader from "@/components/ui/PageHeader";
import { getAccountsSummary, getMonthlySummary } from "./actions";

type DashboardProps = {
  monthlyTransactionSummary: MonthlyTransactionSummary;
  twelveMonthFlow: MonthlyFlow[];
  accountsSummary: AccountMonthlySummary[];
  recentActivity: RecentActivityItem[];
};

export default function Dashboard({
  monthlyTransactionSummary,
  twelveMonthFlow,
  accountsSummary,
  recentActivity,
}: DashboardProps) {
  const { user, loading } = useAuthUser();

  const [transactionSummary, setTransactionSummary] =
    useState<MonthlyTransactionSummary>(monthlyTransactionSummary);
  const [accounts, setAccounts] =
    useState<AccountMonthlySummary[]>(accountsSummary);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  const today = new Date();
  const [selectedMonthYear, setSelectedMonthYear] = useState(
    `${today.getFullYear()}-${today.getMonth() + 1}`,
  );

  const [selectedYearStr, selectedMonthStr] = selectedMonthYear.split("-");
  const selectedMonthLabel = new Date(
    Number(selectedYearStr),
    Number(selectedMonthStr) - 1,
    1,
  )
    .toLocaleString("default", { month: "long" })
    .toUpperCase();

  const handleDateChange = async (value: string) => {
    setSelectedMonthYear(value);
    const [yearStr, monthStr] = value.split("-");
    const month = Number.parseInt(monthStr);
    const year = Number.parseInt(yearStr);

    setIsSummaryLoading(true);

    try {
      const [monthlySummary, accountsSummary] = await Promise.all([
        getMonthlySummary(month, year),
        getAccountsSummary(month, year),
      ]);
      setTransactionSummary(monthlySummary);
      setAccounts(accountsSummary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSummaryLoading(false);
    }
  };

  if (loading || !user) {
    return <Loading />;
  }

  const rawUserName = user.user_metadata?.username?.trim();
  const userName = rawUserName
    ? `${rawUserName.charAt(0).toUpperCase()}${rawUserName.slice(1)}`
    : null;

  return (
    <PageLayout>
      <>
        <PageHeader
          hoverTitle={
            <small>
              {selectedMonthLabel} {selectedYearStr}
            </small>
          }
          title={`${getTimeOfDayGreeting()}
            ${userName || "there"}`}
          actionButtons={[
            <MonthYearSelect
              key={0}
              value={selectedMonthYear}
              onChange={handleDateChange}
            />,
          ]}
        />
        <MonthlyStatsSection
          summary={transactionSummary}
          isLoading={isSummaryLoading}
        />
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.55fr_1fr]">
          <MonthlyFlowCard twelveMonthFlow={twelveMonthFlow} />
          <CategoryBreakdownCard
            categories={transactionSummary.categoryTotals}
            isLoading={isSummaryLoading}
          />
        </section>
        <AccountsOverviewSection
          accounts={accounts}
          isLoading={isSummaryLoading}
        />
        <RecentActivityCard items={recentActivity} />
      </>
    </PageLayout>
  );
}
