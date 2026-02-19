"use client";

import Button from "@/components/Button";
import Select from "@/components/Select";
import TransactionList from "@/components/TransactionList";
import { months } from "@/helpers";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

export default function AccountDetails({
  accountId,
  transactions,
  initialMonth,
  initialYear,
}: {
  accountId: string;
  transactions: Transaction[];
  initialMonth: string;
  initialYear: string;
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
      const res = await fetch(
        `/api/transactions?accountId=${encodeURIComponent(accountId)}&selectedMonth=${selectedMonth}&selectedYear=${selectedYear}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
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

  return (
    <div className="flex flex-col justify-center items-center h-full mt-12">
      <h1 className="text-3xl font-semibold text-center text-red mb-10">
        Account Name
      </h1>
      <div className="relative flex gap-2 justify-around mb-8">
        <Select
          defaultValue={initialMonth}
          options={months}
          handleChange={handleMonthChange}
        />
        <Select
          defaultValue={initialYear}
          options={years}
          handleChange={handleYearChange}
        />
        <Button
          type="button"
          color="secondary"
          text={isFetching ? "Loading..." : "Filter"}
          handleChange={getFilteredTransactions}
        />
      </div>
      <div className="mb-6">
        {errorMessage && (
          <p className="font-semibold text-red-500 mb-4">{errorMessage}</p>
        )}
        {selectedTransactions && selectedTransactions.length > 0 ? (
          <TransactionList transactions={selectedTransactions} />
        ) : (
          <p className="font-bold">No transactions found.</p>
        )}
      </div>
      <Button
        type="button"
        handleChange={() =>
          router.push(`/accounts/${accountId}/transactions/create`)
        }
        color="primary"
        text="Add Transaction"
      />
    </div>
  );
}
