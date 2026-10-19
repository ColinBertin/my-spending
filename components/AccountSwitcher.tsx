"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import { formatCurrencyIntoYen } from "@/helpers";

type AccountSwitcherAccount = {
  id: string;
  name: string;
  balance: number;
};

type AccountSwitcherProps = {
  accounts: AccountSwitcherAccount[];
};

export default function AccountSwitcher({ accounts }: AccountSwitcherProps) {
  const { id: selectedAccountId = accounts[0]?.id } = useParams<{
    id?: string;
  }>();

  return (
    <div className="mb-[18px] flex gap-[9px] overflow-x-auto pb-1">
      {accounts.map((account) => {
        const isActive = account.id === selectedAccountId;

        return (
          <Link
            key={account.id}
            href={`/accounts/${account.id}/details`}
            aria-current={isActive ? "page" : undefined}
            className={clsx(
              "flex min-w-[128px] flex-none cursor-pointer flex-col items-start gap-[7px] rounded-[10px] border px-[13px] py-[11px] text-left sm:min-w-[150px] sm:flex-1 sm:px-[15px] sm:py-3",
              isActive
                ? "border-[#17161A] bg-white shadow-[0_1px_2px_rgba(23,22,26,0.07)]"
                : "border-[#E3DFD7] bg-[#FBFAF7]",
            )}
          >
            <span
              className={clsx(
                "h-[3px] w-full rounded-[2px]",
                isActive ? "bg-[#B04124]" : "bg-[#E3DFD7]",
              )}
            />
            <span
              className={clsx(
                "text-[13px] font-semibold whitespace-nowrap",
                isActive ? "text-[#17161A]" : "text-[#3B3934]",
              )}
            >
              {account.name}
            </span>
            <span
              className={clsx(
                "font-mono text-[15px] font-semibold tabular-nums whitespace-nowrap",
                isActive ? "text-[#17161A]" : "text-[#5C5952]",
              )}
            >
              {formatCurrencyIntoYen(account.balance)}
            </span>
          </Link>
        );
      })}
      <Link
        href="/accounts/create"
        className="flex min-w-[74px] flex-none items-center justify-center rounded-[10px] border border-dashed border-[#C9C3B7] px-[13px] py-[11px] text-[12px] font-medium text-[#5C5952] sm:min-w-[84px] sm:px-[15px] sm:py-3"
      >
        + New
      </Link>
    </div>
  );
}
