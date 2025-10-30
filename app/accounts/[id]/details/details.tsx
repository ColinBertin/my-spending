"use client";

import { getAccountById } from "@/app/lib/getAccount";
import { getMonthlyRangeTransactions } from "@/app/lib/getMonthlyRangeTransactions";
import Button from "@/components/Button";
import Select from "@/components/Select";
import TransactionList from "@/components/TransactionList";
import { Account, Transaction } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountDetails({ id }: { id: string }) {
  const router = useRouter();

  const currentMonth = (new Date().getMonth() + 1).toString();
  const currentYear = new Date().getFullYear().toString();

  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<Transaction[]>();
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<string>(currentYear);

  const months = [
    { id: "1", name: "January" },
    { id: "2", name: "February" },
    { id: "3", name: "March" },
    { id: "4", name: "April" },
    { id: "5", name: "May" },
    { id: "6", name: "June" },
    { id: "7", name: "July" },
    { id: "8", name: "August" },
    { id: "9", name: "September" },
    { id: "10", name: "October" },
    { id: "11", name: "November" },
    { id: "12", name: "December" },
  ];

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
    getAccountById(id).then((account) => {
      setAccount(account);
    });

    getMonthlyRangeTransactions(id, selectedMonth, selectedYear).then(
      (transactions) => {
        setTransactions(transactions);
      },
    );
  }, [id, selectedMonth, selectedYear]);

  return (
    <div className="flex flex-col justify-center items-center h-full mt-12">
      <h1 className="text-3xl font-semibold text-center text-red mb-10">
        {account?.name}
      </h1>
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
      <div className="mb-6">
        {transactions && transactions.length > 0 ? (
          <TransactionList transactions={transactions} />
        ) : (
          <p className="font-bold">No transactions found.</p>
        )}
      </div>
      <Button
        type="button"
        handleChange={() => router.push(`/accounts/${id}/transactions/create`)}
        color="primary"
        text="Add Transaction"
      />
    </div>
  );
}
