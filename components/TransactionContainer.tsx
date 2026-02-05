"use client";

import { Account, Transaction } from "@/types/firestore";
import DoughnutChart from "./Doughnut";
import { useEffect, useState } from "react";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";
import { formatCurrencyIntoYen, months } from "@/helpers";
import MonthlyTransactions from "./MonthlyTransactions";
import Button from "./Button";
import Select from "./Select";
import { getMonthlyRangeTransactions } from "@/app/lib/getMonthlyRangeTransactions";
import { useAuthUser } from "@/utils/useAuthUser";
// import BarChart from "./BarChart";
// import LineChart from "./Chart";

export default function TransactionContainer({
  account,
}: {
  account: Account;
}) {
  const router = useRouter();
  const { user, loading } = useAuthUser();

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  const [transactions, setTransactions] = useState<Transaction[]>();
  const [spending, setSpending] = useState<number[]>();
  const [categories, setCategories] = useState<string[]>();
  const [totalSpending, setTotalSpending] = useState<number>(0);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const { id, name } = account ? account : {};

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

  useEffect(() => {
    if (user && id) {
      getMonthlyRangeTransactions(id, selectedMonth, selectedYear).then(
        (transactions) => {
          const categoryTotals: Record<string, number> = {};
          transactions.forEach((t) => {
            if (!t.categoryName) return;
            if (!categoryTotals[t.categoryName])
              categoryTotals[t.categoryName] = 0;
            categoryTotals[t.categoryName] += t.amount;
          });

          const sortedEntries = Object.entries(categoryTotals).sort(
            ([a], [b]) => a.localeCompare(b),
          );

          const sortedCategories = sortedEntries.map(([category]) => category);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const sortedSpending = sortedEntries.map(([_, total]) => total);

          setTransactions(transactions);
          setCategories(sortedCategories);
          setSpending(sortedSpending);
          setTotalSpending(sortedSpending.reduce((acc, val) => acc + val, 0));
        },
      );
    }
  }, [id, selectedMonth, selectedYear, user]);

  if (loading) return <Loading />;

  return (
    <ul className="">
      {account && (
        <li key={name} className="flex flex-col items-center gap-4">
          <a className="text-2xl font-bold" href={`/accounts/${id}/details`}>
            {name}
          </a>
          <div className="relative flex gap-2 justify-around mb-8">
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
              <p className="text-lg">
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
