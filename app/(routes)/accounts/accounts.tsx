import { useMemo } from "react";
import Link from "next/link";
import { Account, TransactionFlowRow } from "@/types";
import PageLayout from "@/components/ui/PageLayout";
import AccountSwitcher from "@/components/AccountSwitcher";
import MonthStepper from "@/components/MonthStepper";
import PageHeader from "@/components/ui/PageHeader";

interface AccountsProps {
  accounts: Account[];
  transactions: TransactionFlowRow[];
}

export default function Accounts({ accounts, transactions }: AccountsProps) {
  const accountsMonthlySummary = useMemo(() => {
    return accounts
      .filter((account): account is Account & { id: string } =>
        Boolean(account.id),
      )
      .map((account) => {
        const incomeSummary = transactions.reduce((total, transaction) => {
          if (
            transaction.account_id === account.id &&
            transaction.type === "income"
          ) {
            return total + transaction.amount;
          }
          return total;
        }, 0);

        const spendingSummary = transactions.reduce((total, transaction) => {
          if (
            transaction.account_id === account.id &&
            transaction.type === "expense"
          ) {
            return total + transaction.amount;
          }
          return total;
        }, 0);

        const entryCount = transactions.filter(
          (transaction) => transaction.account_id === account.id,
        ).length;
        const balance = incomeSummary - spendingSummary;

        return {
          id: account.id,
          name: account.name,
          type: account.type,
          currency: account.currency,
          createdAt: account.created_at,
          entryCount,
          balance,
          income: incomeSummary,
          spending: spendingSummary,
          savedPercentage:
            incomeSummary > 0 ? (balance / incomeSummary) * 100 : 0,
          spentPercentage:
            incomeSummary > 0 ? (spendingSummary / incomeSummary) * 100 : 0,
        };
      });
  }, [accounts, transactions]);

  const activeAccount = accountsMonthlySummary[0];
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
    <PageLayout>
      <>
        <div className="mb-[11px] flex justify-end">
          <span className="font-mono text-[10px] tracking-[0.14em] text-[#5C5952] uppercase">
            {accountsMonthlySummary.length} accounts
          </span>
        </div>
        <AccountSwitcher accounts={accountsMonthlySummary} />
        <PageHeader
          title={activeAccount.name}
          subTitle={subTitle}
          actionButtons={[
            <MonthStepper key={0} />,
            <Link
              key={1}
              href={`/accounts/${activeAccount.id}/transactions/create`}
              className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[9px] bg-[#B04124] px-[15px] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B] md:h-[38px]"
            >
              Add transaction
            </Link>,
          ]}
        />
      </>
    </PageLayout>
  );
}
