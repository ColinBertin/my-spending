"use client";

import {
  ArrowRightIcon,
  CreditCardIcon,
  DocumentChartBarIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import Loading from "../loading";
import { DashboardAccountSummary } from "../../types";
import { useAuthUser } from "../../utils/useAuthUser";
import TransactionContainer from "../../components/TransactionContainer";
import { getTimeOfDayGreeting } from "../../helpers";

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

  if (loading || !user) {
    return <Loading />;
  }

  const rawUserName = user.user_metadata?.username?.trim();
  const userName = rawUserName
    ? `${rawUserName.charAt(0).toUpperCase()}${rawUserName.slice(1)}`
    : null;
  const quickLinks = [
    {
      title: "New Account",
      description: "Create a fresh account in one step",
      href: "/accounts/create",
      Icon: CreditCardIcon,
    },
    {
      title: "New Category",
      description: "Add a category for cleaner tracking",
      href: "/categories/create",
      Icon: TagIcon,
    },
    {
      title: "Pro: Generate Ledger",
      description: "Open the professional ledger tools",
      href: "/ledger-generator",
      Icon: DocumentChartBarIcon,
    },
  ];

  return (
    <div className="pt-24 sm:pt-30 pb-20 px-4 sm:px-6 flex flex-col justify-center items-center gap-10">
      <h2 className="text-3xl font-bold">
        {getTimeOfDayGreeting()}
        {userName || "there"}!
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
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 justify-center gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group mx-auto flex w-full max-w-xs items-center justify-between rounded-2xl border border-orange-dark/20 bg-gradient-to-br from-orange-dark to-orange-light px-4 py-3 text-white shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:shadow-md sm:min-h-28 sm:flex-col sm:items-stretch sm:justify-between sm:px-4 sm:py-4"
            >
              <div className="flex min-w-0 items-center gap-3 sm:justify-between">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:h-10 sm:w-10">
                  <link.Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 sm:mt-4">
                  <p className="truncate text-sm font-semibold leading-5 sm:truncate-none">
                    {link.title}
                  </p>
                  <p className="mt-1 hidden text-xs leading-5 text-white/85 sm:block">
                    {link.description}
                  </p>
                </div>
              </div>
              <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 sm:self-end" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
