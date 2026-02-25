"use client";

import Loading from "../../loading";
import { Account } from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
import TransactionContainer from "@/components/TransactionContainer";

export default function Dashboard({ accounts }: { accounts: Account[] }) {
  const { user, loading } = useAuthUser();
  const accountsWithId = accounts.filter(
    (account): account is Account & { id: string } => Boolean(account.id),
  );

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
    <div className="pt-24 sm:pt-30 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {user.user_metadata?.username || user.email || "there"}!
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-5">
        {accountsWithId.map((account) => (
          <section
            key={account.id}
            className="w-full max-w-[34rem] mx-auto rounded-2xl border border-blue-dark/20 bg-white p-3 sm:p-4 shadow-sm"
          >
            <TransactionContainer account={account} />
          </section>
        ))}
      </div>
      {accountsWithId.length === 0 && (
        <p className="text-lg font-semibold">No accounts found yet.</p>
      )}
    </div>
  );
}
