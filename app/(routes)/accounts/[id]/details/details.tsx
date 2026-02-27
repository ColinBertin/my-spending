"use client";

import Button from "../../../../../components/Button";
import LineChart from "../../../../../components/Chart";
import Select from "../../../../../components/Select";
import TransactionList from "../../../../../components/TransactionList";
import { months } from "../../../../../helpers";
import { Transaction } from "../../../../../types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function AccountDetails({
  accountId,
  transactions,
  initialMonth,
  initialYear,
  accountName,
}: {
  accountId: string;
  transactions: Transaction[];
  initialMonth: string;
  initialYear: string;
  accountName: string;
}) {
  const router = useRouter();

  const [selectedMonth, setSelectedMonth] = useState<string>(initialMonth);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedTransactions, setSelectedTransactions] =
    useState<Transaction[]>(transactions);
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const years = useMemo(
    () =>
      Array.from(
        { length: 8 },
        (_, i) => parseInt(initialYear, 10) - 5 + i,
      ).map((year) => ({ id: year.toString(), name: year.toString() })),
    [initialYear],
  );

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(e.target.value);
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(e.target.value);
  };

  const getFilteredTransactions = useCallback(async () => {
    setIsFetching(true);
    setErrorMessage("");

    try {
      const url = `/api/transactions?accountId=${encodeURIComponent(accountId)}&selectedMonth=${selectedMonth}&selectedYear=${selectedYear}`;
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json.error ?? "Failed to get transactions");
      }

      setSelectedTransactions(json.transactions ?? []);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to get transactions",
      );
    } finally {
      setIsFetching(false);
    }
  }, [accountId, selectedMonth, selectedYear]);

  const chartLabels = useMemo(
    () =>
      selectedTransactions.map((transaction) =>
        (transaction.date instanceof Date
          ? transaction.date
          : new Date(transaction.date)
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      ),
    [selectedTransactions],
  );

  const chartData = useMemo(
    () => selectedTransactions.map((transaction) => Number(transaction.amount)),
    [selectedTransactions],
  );

  return (
    <div className="w-full px-4 sm:px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-center text-red mb-8">
          {accountName}
        </h1>

        <div className="w-full rounded-2xl border border-blue-dark/20 bg-white p-4 sm:p-6 shadow-sm">
          {chartData.length > 0 && (
            <div className="w-full flex justify-center mb-8">
              <LineChart
                labelSet={chartLabels}
                dataSet={chartData}
                datasetLabel="Amount"
              />
            </div>
          )}

          <div className="w-full max-w-lg mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 mb-8">
            <Select
              defaultValue={initialMonth}
              options={months}
              handleChange={handleMonthChange}
              className="sm:w-40"
            />
            <Select
              defaultValue={initialYear}
              options={years}
              handleChange={handleYearChange}
              className="sm:w-40"
            />
            <Button
              type="button"
              color="secondary"
              disabled={isFetching}
              text={isFetching ? "Loading..." : "Filter"}
              handleChange={getFilteredTransactions}
            />
          </div>

          {errorMessage && (
            <p className="font-semibold text-red-500 text-center mb-4">
              {errorMessage}
            </p>
          )}

          <div className="w-full flex justify-center">
            {selectedTransactions && selectedTransactions.length > 0 ? (
              <TransactionList transactions={selectedTransactions} />
            ) : (
              <p className="font-bold text-center">No transactions found.</p>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button
            type="button"
            handleChange={() =>
              router.push(`/accounts/${accountId}/transactions/create`)
            }
            color="primary"
            text="Add Transaction"
          />
        </div>
      </div>
    </div>
  );
}
