import { AccountMonthlySummary } from "@/types";
import AccountSummaryCard from "@/components/AccountSummaryCard";
import AccountSummaryCardSkeleton from "@/components/AccountSummaryCardSkeleton";

type AccountsOverviewSectionProps = {
  accounts: AccountMonthlySummary[];
  isLoading: boolean;
};

export default function AccountsOverviewSection({
  accounts,
  isLoading,
}: AccountsOverviewSectionProps) {
  return (
    <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading
        ? Array.from({ length: accounts.length }, (_, i) => (
            <AccountSummaryCardSkeleton key={i} />
          ))
        : accounts.map((account) => (
            <AccountSummaryCard key={account.id} account={account} />
          ))}
    </section>
  );
}
