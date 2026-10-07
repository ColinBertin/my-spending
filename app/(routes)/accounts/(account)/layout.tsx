import { ReactNode } from "react";
import PageLayout from "@/components/ui/PageLayout";
import AccountSwitcher from "@/components/AccountSwitcher";
import AccountHeader from "./[id]/account-header";
import { getAccountsMonthlySummary } from "./data";

export const metadata = {
  title: "Accounts",
};

export default async function AccountsLayout({
  children,
}: {
  children: ReactNode;
}) {
  const accountsMonthlySummary = await getAccountsMonthlySummary();

  return (
    <PageLayout>
      <>
        <div className="mb-[11px] flex items-baseline justify-between gap-3">
          <span className="font-mono text-[10px] tracking-[0.14em] text-[#5C5952] uppercase">
            {accountsMonthlySummary.length} accounts
          </span>
        </div>
        <AccountSwitcher accounts={accountsMonthlySummary} />
        <AccountHeader accounts={accountsMonthlySummary} />
        {children}
      </>
    </PageLayout>
  );
}
