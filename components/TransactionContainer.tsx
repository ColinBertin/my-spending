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
  const [selectedMonth, setSelectedMonth] = useState<string>(
    initialSummary.selectedMonth,
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    initialSummary.selectedYear,
  );

  const { id, name } = account;

  const categories = useMemo(
    () => categoryTotals.map((item) => item.category),
    [categoryTotals],
  );
  const spending = useMemo(
    () => categoryTotals.map((item) => item.total),
    [categoryTotals],
  );

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
  }, [account.id, selectedMonth, selectedYear]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    getCategoryTotals().catch(() => {
      setCategoryTotals([]);
      setTotalSpending(0);
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
        {categoryTotals.length > 0 ? (
          <>
            <DoughnutChart labelSet={categories} dataSet={spending} />
            <p className="text-base sm:text-lg font-semibold">
              Total Spending: {formatCurrencyIntoYen(totalSpending)}
            </p>
            <MonthlyTransactions categoryTotals={categoryTotals} />
          </>
        ) : (
          <p className="font-bold">No spending found for this period.</p>
        )}
      </li>
    </ul>
  );
}
