"use client";

import { Account } from "@/types/firestore";
import DoughnutChart from "./Doughnut";
import { useEffect, useState } from "react";
import { getTransactions } from "@/app/lib/getTransactions";
import { auth } from "@/app/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "@/app/loading";
import { useRouter } from "next/navigation";

export default function TransactionContainer({
  account,
}: {
  account: Account;
}) {
  const router = useRouter();
  const [user, loading] = useAuthState(auth);

  const [spending, setSpending] = useState<number[]>();
  const [categories, setCategories] = useState<string[]>();

  const { id, name } = account ? account : {};

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
        <li key={name} className="flex flex-col items-center gap-4">
          <a className="text-xl" href={`/accounts/${id}/details`}>{name}</a>
          <DoughnutChart labelSet={categories || []} dataSet={spending || []} />
          <button
            className="bg-blue-dark hover:bg-blue-light text-white font-semibold py-2 px-4 rounded-3xl self-center mb-2 sm:mb-0 cursor-pointer"
            onClick={() =>
              router.push(`/accounts/${account.id}/transactions/create`)
            }
          >
            Add Transaction
          </button>
        </li>
      )}
    </ul>
  );
}
