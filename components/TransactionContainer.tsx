"use client";

import { Account, Transaction } from "@/types";
import DoughnutChart from "./Doughnut";
import { useCallback, useEffect, useState } from "react";
// import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { formatCurrencyIntoYen, months } from "@/helpers";
import MonthlyTransactions from "./MonthlyTransactions";
import Button from "./Button";
import Select from "./Select";
import { FaUser, FaUsers, FaUserTie } from "react-icons/fa";
// import BarChart from "./BarChart";
// import LineChart from "./Chart";

export default function TransactionContainer({
  account,
}: {
  account: Account;
}) {
  const router = useRouter();

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  // const [isFetching, setIsFetching] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [spending, setSpending] = useState<number[]>();
  const [categories, setCategories] = useState<string[]>();
  const [totalSpending, setTotalSpending] = useState<number>(0);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const { id, name } = account ? account : {};

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

  const getTransactions = useCallback(async () => {
    const res = await fetch(
      `/api/transactions?accountId=${account.id}&selectedMonth=${selectedMonth}&selectedYear=${selectedYear}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to get transactions");
    }
    if (json.transactions) {
      const categoryTotals: Record<string, number> = {};
      const { transactions } = json;
      transactions.forEach((t: Transaction) => {
        if (!t.category_name) return;
        if (!categoryTotals[t.category_name])
          categoryTotals[t.category_name] = 0;
        categoryTotals[t.category_name] += t.amount;
      });

      const sortedEntries = Object.entries(categoryTotals).sort(([a], [b]) =>
        a.localeCompare(b),
      );

      const sortedCategories = sortedEntries.map(([category]) => category);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sortedSpending = sortedEntries.map(([_, total]) => total);

      setTransactions(transactions);
      setCategories(sortedCategories);
      setSpending(sortedSpending);
      setTotalSpending(sortedSpending.reduce((acc, val) => acc + val, 0));
      setTransactions(json.transactions);
    }
  }, [account.id, selectedMonth, selectedYear]);

  useEffect(() => {
    getTransactions();
  }, [getTransactions]);

  // if (isFetching) return <Loading />;

  return (
    <ul className="">
      {account && (
        <li key={name} className="flex flex-col items-center gap-3">
          <a
            className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-blue-dark"
            href={`/accounts/${id}/details`}
          >
            {getAccountTypeIcon(account.type)}
            <span>{name}</span>
          </a>
          <div className="relative flex gap-2 justify-around mb-4">
            <Select
              defaultValue={currentMonth}
              options={months}
              onChange={handleMonthChange}
            />
            <Select
              defaultValue={currentYear}
              options={years}
              onChange={handleYearChange}
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
          {categories && categories.length > 0 ? (
            <>
              <DoughnutChart
                labelSet={categories || []}
                dataSet={spending || []}
              />
              {/* <BarChart labelSet={categories || []} dataSet={spending || []} /> */}
              {/* <LineChart labelSet={categories || []} dataSet={spending || []} /> */}
              <p className="text-base sm:text-lg font-semibold">
                Total Spending: {formatCurrencyIntoYen(totalSpending)}
              </p>
              <MonthlyTransactions
                accountId={id as string}
                transactions={transactions}
              />
            </>
          ) : (
            <p className="font-bold">No transactions found for this period.</p>
          )}
        </li>
      )}
    </ul>
  );
}
