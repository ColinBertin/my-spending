import { getThisMonthTransactions } from "@/app/lib/getThisMonthTransactions";
import { formatCurrencyIntoYen } from "@/helpers";
import { Transaction } from "@/types/firestore";
import { useEffect, useState } from "react";

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
    <ul>
      {currentMonthTransactions &&
        currentMonthTransactions.map((transaction) => (
          <li key={transaction.id}>
            {(transaction.date instanceof Date
              ? transaction.date
              : new Date(transaction.date)
            ).toLocaleDateString()}{" "}
            - {transaction.categoryName}:{" "}
            {formatCurrencyIntoYen(transaction.amount)}
          </li>
        ))}
    </ul>
  );
}
