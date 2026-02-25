"use client";

import Loading from "../../loading";
import { DashboardAccountSummary } from "@/types";
import { useAuthUser } from "@/utils/useAuthUser";
import TransactionContainer from "@/components/TransactionContainer";

export default function Dashboard({
  accountSummaries,
}: {
  accountSummaries: DashboardAccountSummary[];
}) {
  const { user, loading } = useAuthUser();
  const accountSummariesWithId = accountSummaries.filter(
    (
      accountSummary,
    ): accountSummary is DashboardAccountSummary & {
      account: DashboardAccountSummary["account"] & { id: string };
    } => Boolean(accountSummary.account.id),
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

  const rawUserName = user.user_metadata?.username?.trim();
  const userName = rawUserName
    ? `${rawUserName.charAt(0).toUpperCase()}${rawUserName.slice(1)}`
    : null;

  return (
    <div className="pt-24 sm:pt-30 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {userName || user.email || "there"}!
      </h2>
      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-2 gap-5">
        {accountSummariesWithId.map(({ account, summary }) => (
          <section
            key={account.id}
            className="w-full max-w-[34rem] mx-auto rounded-2xl border border-blue-dark/20 bg-white p-3 sm:p-4 shadow-sm"
          >
            <TransactionContainer account={account} initialSummary={summary} />
          </section>
        ))}
      </div>
      {accountSummariesWithId.length === 0 && (
        <p className="text-lg font-semibold">No accounts found yet.</p>
      )}
    </div>
  );
}
