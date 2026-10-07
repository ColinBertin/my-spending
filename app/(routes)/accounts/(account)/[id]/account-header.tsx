"use client";

import Link from "next/link";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { Account } from "@/types";
import MonthStepper from "@/components/MonthStepper";
import PageHeader from "@/components/ui/PageHeader";
import { MONTH_PARAM, parseMonthParam, toMonthParam } from "../month-param";

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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeAccount =
    accounts.find((account) => account.id === selectedId) ?? accounts[0];

  if (!activeAccount || pathname.endsWith("/transactions/create")) {
    return null;
  }

  const isDetails = pathname.endsWith("/details");
  const monthParam = searchParams.get(MONTH_PARAM);
  const now = new Date();
  const selectedMonth = parseMonthParam(monthParam) ?? {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  };

  const handleMonthChange = (date: Date) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(
      MONTH_PARAM,
      toMonthParam({ year: date.getFullYear(), month: date.getMonth() + 1 }),
    );
    window.history.replaceState(null, "", `${pathname}?${params}`);
  };

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
        isDetails && (
          <MonthStepper
            key={`month-${monthParam ?? ""}`}
            initialDate={
              new Date(selectedMonth.year, selectedMonth.month - 1, 1)
            }
            onChange={handleMonthChange}
          />
        ),
        <Link
          key="add-transaction"
          href={`/accounts/${activeAccount.id}/transactions/create`}
          className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[9px] bg-[#B04124] px-[15px] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B] md:h-[38px]"
        >
          Add transaction
        </Link>,
      ]}
    />
  );
}
