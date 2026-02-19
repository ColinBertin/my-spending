"use client";

import Loading from "../../loading";
import { Account } from "@/types";
import TransactionContainer from "@/components/TransactionContainer";
import { useAuthUser } from "@/utils/useAuthUser";

export default function Dashboard({
  singleAccounts,
  sharedAccounts,
}: {
  singleAccounts: Account[];
  sharedAccounts: Account[];
}) {
  const { user, loading } = useAuthUser();

  function getTimeOfDayGreeting() {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();

    if (currentHour >= 5 && currentHour < 12) {
      return "Good morning, ";
    } else if (currentHour >= 12 && currentHour < 18) {
      return "Good afternoon, ";
    } else {
      return "Good evening, ";
    }
  }

  if (loading || !user) return <Loading />;

  return (
    <div className="pt-24 sm:pt-30 pb-20 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {user.user_metadata?.username || user.email || "there"}!
      </h2>
      <div className="flex justify-around w-full sm:w-2/3 flex-wrap gap-18">
        {/* Single Accounts */}
        {singleAccounts && <TransactionContainer account={singleAccounts[0]} />}
        {/* Shared Accounts */}
        {sharedAccounts && <TransactionContainer account={sharedAccounts[0]} />}
      </div>
    </div>
  );
}
