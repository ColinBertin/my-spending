"use client";

import { auth } from "../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../loading";
// import LineChart from "@/components/Chart";
// import BarChart from "@/components/BarChart";
import { useEffect, useState } from "react";
import { getAccounts } from "../lib/getAccounts";
import { Account } from "@/types/firestore";
import TransactionContainer from "@/components/TransactionContainer";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  const [myAccounts, setMyAccounts] = useState<Account[]>([]);
  // const [mySharedAccounts, setMySharedAccounts] = useState<Account[]>([]);

  useEffect(() => {
    if (user) {
      getAccounts().then((accounts) => {
        const singleAccounts = accounts.filter(
          (account) => account.type === "single"
        );
        // const sharedAccounts = accounts.filter(
        //   (account) => account.type === "shared"
        // );
        setMyAccounts(singleAccounts);
        // setMySharedAccounts(sharedAccounts);
      });
    }
  }, [user]);

  if (!user) return <Loading />;

  return (
    <div className="pt-20 pb-20 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        Welcome{user.displayName && `, ${user.displayName}!`}
      </h2>
      <div className="">
        {/* Single Accounts */}
        {myAccounts && <TransactionContainer account={myAccounts[0]} />}
        {/* Shared Accounts */}
        {/* {mySharedAccounts && (
          <TransactionContainer account={mySharedAccounts[0]} />
        )} */}
      </div>
      <button
        className="bg-blue-dark hover:bg-blue-light text-white font-semibold py-2 px-4 rounded-3xl self-center mb-2 sm:mb-0 cursor-pointer"
        onClick={() => router.push(`/accounts/${myAccounts[0]?.id}/transactions/create`)}
      >
        Add Transaction
      </button>
    </div>
  );
}
