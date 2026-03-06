"use client";

import { Account, CategoryTotal, MonthlyCategorySummary } from "@/types";
import DoughnutChart from "./Doughnut";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyIntoYen, months } from "@/helpers";
import MonthlyTransactions from "./MonthlyTransactions";
import Button from "./Button";
import Select from "./Select";
import { FaUser, FaUsers, FaUserTie } from "react-icons/fa";
import { ArrowUpRight } from "lucide-react";
import TransactionFlowIcon from "./TransactionFlowIcon";

export default function TransactionContainer({
  account,
  initialSummary,
}: {
  account: Account & { id: string };
  initialSummary: MonthlyCategorySummary;
}) {
  const router = useRouter();
  const hasMounted = useRef(false);

  const currentYear = new Date().getFullYear().toString();

  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>(
    initialSummary.categoryTotals,
  );
  const [totalSpending, setTotalSpending] = useState<number>(
    initialSummary.totalSpending,
  );
  const [totalIncome, setTotalIncome] = useState<number>(
    initialSummary.totalIncome,
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialSummary.selectedMonth,
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    initialSummary.selectedYear,
  );

  const { id, name } = account;

  const categories = useMemo(
    () =>
      categoryTotals
        .filter((item) => item.type === "expense")
        .map((item) => item.category),
    [categoryTotals],
  );
  const spending = useMemo(
    () =>
      categoryTotals
        .filter((item) => item.type === "expense")
        .map((item) => item.total),
    [categoryTotals],
  );
  const hasTransactions =
    categoryTotals.length > 0 || totalIncome > 0 || totalSpending > 0;

  const getAccountTypeIcon = (type: Account["type"]) => {
    if (type === "single") return <FaUser className="h-5 w-5" />;
    if (type === "shared") return <FaUsers className="h-5 w-5" />;
    return <FaUserTie className="h-5 w-5" />;
  };

  const years = Array.from(
    { length: 8 },
    (_, i) => parseInt(currentYear) - 5 + i,
  ).map((year) => ({ id: year.toString(), name: year.toString() }));

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const getCategoryTotals = useCallback(async () => {
    const res = await fetch(
      `/api/transactions?summary=true&accountId=${account.id}&selectedMonth=${selectedMonth}&selectedYear=${selectedYear}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to get category totals");
    }

    setCategoryTotals((json.categoryTotals as CategoryTotal[]) ?? []);
    setTotalSpending(Number(json.totalSpending) || 0);
    setTotalIncome(Number(json.totalIncome) || 0);
  }, [account.id, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    getCategoryTotals().catch(() => {
      setCategoryTotals([]);
      setTotalSpending(0);
      setTotalIncome(0);
    });
  }, [getCategoryTotals]);

  return (
    <ul className="">
      <li key={name} className="flex flex-col items-center gap-3">
        <a
          className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-blue-dark"
          href={`/accounts/${id}/details`}
        >
          {getAccountTypeIcon(account.type)}
          <span>{name}</span>
          <ArrowUpRight
            aria-hidden="true"
            className="h-4 w-4 text-blue-dark/70 sm:h-5 sm:w-5"
          />
        </a>
        <div className="relative flex flex-wrap gap-2 justify-center mb-4">
          <Select
            defaultValue={initialSummary.selectedMonth}
            options={months}
            onChange={handleMonthChange}
            className="sm:w-40"
          />
          <Select
            defaultValue={initialSummary.selectedYear}
            options={years}
            onChange={handleYearChange}
            className="sm:w-40"
          />
        </div>
        <Button
          type="button"
          handleChange={() =>
            router.push(`/accounts/${account.id}/transactions/create`)
          }
          text="Add Transaction"
          color="primary"
        />
        {spending.length > 0 ? (
          <>
            <DoughnutChart labelSet={categories} dataSet={spending} />
          </>
        ) : (
          <p className="font-bold">No spending found for this period.</p>
        )}
        {hasTransactions && (
          <div className="grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-left">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <TransactionFlowIcon type="income" className="h-7 w-7" />
                <span>Income</span>
              </div>
              <p className="text-base font-semibold text-emerald-800 sm:text-lg">
                {formatCurrencyIntoYen(totalIncome)}
              </p>
            </div>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-left">
              <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-rose-700">
                <TransactionFlowIcon type="expense" className="h-7 w-7" />
                <span>Spending</span>
              </div>
              <p className="text-base font-semibold text-rose-800 sm:text-lg">
                {formatCurrencyIntoYen(totalSpending)}
              </p>
            </div>
          </div>
        )}
        {categoryTotals.length > 0 && (
          <MonthlyTransactions categoryTotals={categoryTotals} />
        )}
      </li>
    </ul>
  );
}
