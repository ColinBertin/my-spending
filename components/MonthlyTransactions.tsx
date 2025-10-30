import { getThisMonthTransactions } from "@/app/lib/getThisMonthTransactions";
import { Transaction } from "@/types/firestore";
import { useEffect, useState } from "react";
import TransactionList from "./TransactionList";

export default function MonthlyTransactions({
  accountId,
}: {
  accountId: string;
}) {
  const [currentMonthTransactions, setCurrentMonthTransactions] =
    useState<Transaction[]>();

  useEffect(() => {
    getThisMonthTransactions(accountId).then((transactions) => {
      setCurrentMonthTransactions(transactions);
    });
  }, [accountId]);

  return (
    currentMonthTransactions && (
      <TransactionList transactions={currentMonthTransactions} />
    )
  );
}
