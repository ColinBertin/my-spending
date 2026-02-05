"use client";

import Loading from "../loading";
// import LineChart from "@/components/Chart";
// import BarChart from "@/components/BarChart";
import { useEffect, useState } from "react";
import { getAccounts } from "../lib/getAccounts";
import { Account } from "@/types/firestore";
import TransactionContainer from "@/components/TransactionContainer";
import { useAuthUser } from "@/utils/useAuthUser";

export default function Dashboard() {
  const { user, loading } = useAuthUser();

  const [myAccounts, setMyAccounts] = useState<Account[]>([]);
  const [mySharedAccounts, setMySharedAccounts] = useState<Account[]>([]);

  function getTimeOfDayGreeting() {
    const currentTime = new Date();
    const currentHour = currentTime.getHours(); // Gets the hour (0-23)

    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning, ";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon, ";
    } else {
      return "Good evening, ";
    }
  }

  useEffect(() => {
    if (user) {
      getAccounts().then((accounts) => {
        const singleAccounts = accounts.filter(
          (account) => account.type === "single",
        );
        const sharedAccounts = accounts.filter(
          (account) => account.type === "shared",
        );
        setMyAccounts(singleAccounts);
        setMySharedAccounts(sharedAccounts);
      });
    }
  }, [user]);

  if (loading || !user) return <Loading />;

  return (
    <div className="pt-24 sm:pt-30 pb-20 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {user.user_metadata?.username || user.email || "there"}!
      </h2>
      <div className="flex justify-around w-full sm:w-2/3 flex-wrap gap-18">
        {/* Single Accounts */}
        {myAccounts && <TransactionContainer account={myAccounts[0]} />}
        {/* Shared Accounts */}
        {mySharedAccounts && (
          <TransactionContainer account={mySharedAccounts[0]} />
        )}
      </div>
    </div>
  );
}
