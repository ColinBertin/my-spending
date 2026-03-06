import { XMarkIcon } from "@heroicons/react/24/outline";
import TransactionContainer from "./TransactionContainer";
import { DashboardAccountSummary } from "@/types";

type AccountCardProps = {
  account: DashboardAccountSummary;
  handleDialog: ({
    id,
    name,
    transactionCount,
  }: {
    id: string;
    name: string;
    transactionCount: number;
  }) => void;
};

export default function AccountCard({
  account,
  handleDialog,
}: AccountCardProps) {
  const { account: selectedAccount, summary, transactionCount } = account;
  const { id, name } = selectedAccount;

  if (!id) {
    return undefined;
  }

  const accountWithId = { ...selectedAccount, id };

  return (
    <section className="relative w-full max-w-[34rem] mx-auto rounded-2xl border border-blue-dark/20 bg-white p-3 sm:p-4 shadow-sm">
      <button
        type="button"
        onClick={() =>
          handleDialog({
            id,
            name,
            transactionCount,
          })
        }
        aria-label={`Delete ${name}`}
        title={`Delete ${name}`}
        className="absolute right-3 top-3 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-red-500"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
      <TransactionContainer account={accountWithId} initialSummary={summary} />
    </section>
  );
}
