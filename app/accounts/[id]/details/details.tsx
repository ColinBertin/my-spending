"use client";

import { getAccountById } from "@/app/lib/getAccount";
import { getTransactions } from "@/app/lib/getTransactions";
import Button from "@/components/Button";
import { formatCurrencyIntoYen } from "@/helpers";
import { Account, Transaction } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountDetails({ id }: { id: string }) {
  const router = useRouter();

  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<Transaction[]>();

  useEffect(() => {
    getAccountById(id).then((account) => {
      setAccount(account);
    });

    getTransactions(id).then((transactions) => {
      const sortedTransactions =
        transactions.length > 1
          ? transactions.sort((a, b) => a.date.getTime() - b.date.getTime())
          : transactions;
      setTransactions(sortedTransactions);
    });
  }, [id]);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl font-semibold text-center text-red mb-10">
        {account?.name}
      </h1>
      <ul className="mb-4">
        {transactions &&
          transactions.map((transaction) => (
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
      <Button
        type="button"
        handleChange={() => router.push(`/accounts/${id}/transactions/create`)}
        color="primary"
        text="Add Transaction"
      />
    </div>
  );
}
