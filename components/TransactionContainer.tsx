"use client";

import { Account } from "@/types/firestore";
import DoughnutChart from "./Doughnut";
import { useEffect, useState } from "react";
import { getTransactions } from "@/app/lib/getTransactions";
import { auth } from "@/app/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "@/app/loading";

export default function TransactionContainer({
  account,
}: {
  account: Account;
}) {
  const [user, loading] = useAuthState(auth);

  const [spending, setSpending] = useState<number[]>();
  const [categories, setCategories] = useState<string[]>();

  const { id, name, type } = account ? account : {};

  useEffect(() => {
    if (user && id) {
      getTransactions(id as string).then((transactions) => {
        const categoryTotals: Record<string, number> = {};

        transactions.forEach((t) => {
          if (!t.categoryName) return;
          if (!categoryTotals[t.categoryName])
            categoryTotals[t.categoryName] = 0;
          categoryTotals[t.categoryName] += t.amount;
        });

        const sortedEntries = Object.entries(categoryTotals).sort(([a], [b]) =>
          a.localeCompare(b)
        );

        const sortedCategories = sortedEntries.map(([category]) => category);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sortedSpending = sortedEntries.map(([_, total]) => total);

        setCategories(sortedCategories);
        setSpending(sortedSpending);
      });
    }
  }, [id, user]);

  if (loading) return <Loading />;

  return (
    <ul>
      {account && (
        <li key={name}>
          <a href={`/accounts/${id}/details`}>Name: {name}</a>
          <p>Type: {type}</p>
          <DoughnutChart labelSet={categories || []} dataSet={spending || []} />
        </li>
      )}
    </ul>
  );
}
