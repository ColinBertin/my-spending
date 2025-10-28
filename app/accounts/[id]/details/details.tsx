"use client";

import { getAccountById } from "@/app/lib/getAccount";
import { getTransactions } from "@/app/lib/getTransactions";
import { Account, Transaction } from "@/types/firestore";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AccountDetails({ id }: { id: string }) {
  const [account, setAccount] = useState<Account>();
  const [transactions, setTransactions] = useState<Transaction[]>();

  useEffect(() => {
    getAccountById(id).then((account) => {
      setAccount(account);
    });

    getTransactions(id).then((transactions) => {
      const sortedTransactions = transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
      setTransactions(sortedTransactions);
    });
  }, [id]);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <h1 className="text-3xl font-semibold text-center text-red mb-10">
        Account Details {account?.name}
      </h1>
      <ul>
        {transactions &&
          transactions.map((transaction) => (
            <li key={transaction.id}>
              {(transaction.date instanceof Date
                ? transaction.date
                : new Date(transaction.date)
              ).toLocaleDateString()}{" "}
              - {transaction.categoryName}: ¥{transaction.amount}
            </li>
          ))}
      </ul>
      <Link
        href={`/accounts/${id}/transactions/create`}
        className="bg-blue-dark hover:bg-blue-light text-white font-semibold mt-4 py-2 px-4 rounded-3xl self-center"
      >
        Add Transaction
      </Link>
    </div>
  );
}
