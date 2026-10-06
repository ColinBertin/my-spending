"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Account } from "@/types";
import MonthStepper from "@/components/MonthStepper";
import PageHeader from "@/components/ui/PageHeader";

export type AccountSummary = {
  id: string;
  name: string;
  type: Account["type"];
  currency: string;
  createdAt?: string;
  entryCount: number;
  balance: number;
  income: number;
  spending: number;
  savedPercentage: number;
  spentPercentage: number;
};

interface AccountHeaderProps {
  accounts: AccountSummary[];
}

export default function AccountHeader({ accounts }: AccountHeaderProps) {
  const { id: selectedId } = useParams<{ id?: string }>();
  const activeAccount =
    accounts.find((account) => account.id === selectedId) ?? accounts[0];

  if (!activeAccount) {
    return null;
  }

  const openedLabel = activeAccount.createdAt
    ? new Date(activeAccount.createdAt)
        .toLocaleString("default", { month: "short", year: "numeric" })
        .toUpperCase()
    : null;
  const subTitle = [
    activeAccount.type.toUpperCase(),
    activeAccount.currency,
    openedLabel && `OPENED ${openedLabel}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageHeader
      title={activeAccount.name}
      subTitle={subTitle}
      actionButtons={[
        <MonthStepper key={0} onChange={(e) => console.log(e)} />,
        <Link
          key={1}
          href={`/accounts/${activeAccount.id}/transactions/create`}
          className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[9px] bg-[#B04124] px-[15px] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B] md:h-[38px]"
        >
          Add transaction
        </Link>,
      ]}
    />
  );
}
