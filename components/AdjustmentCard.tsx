import Link from "next/link";
import TransactionFlowIcon from "./TransactionFlowIcon";
import { formatCurrencyIntoYen } from "@/helpers";

type AdjustmentCardProps = {
  categoryName: string;
  receivableCount: number;
  hasIncome: boolean;
  hasSpending: boolean;
  income: number;
  spending: number;
  netTotal: number;
};

export default function AdjustmentCard({
  categoryName,
  receivableCount,
  hasIncome,
  hasSpending,
  income,
  spending,
  netTotal,
}: AdjustmentCardProps) {
  return (
    <div className="rounded-xl border border-blue-dark/20 bg-gray-50 p-4 flex flex-col gap-3">
      <div>
        <h3 className="text-base font-semibold text-blue-dark leading-6">
          {categoryName}
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {receivableCount} transaction
          {receivableCount === 1 ? "" : "s"}
        </p>
        {(hasIncome || hasSpending) && (
          <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
            {hasIncome && (
              <p className="flex items-center gap-2">
                <TransactionFlowIcon type="income" className="h-6 w-6" />
                <span>Income: {formatCurrencyIntoYen(income)}</span>
              </p>
            )}
            {hasSpending && (
              <p className="flex items-center gap-2">
                <TransactionFlowIcon type="expense" className="h-6 w-6" />
                <span>Spending: {formatCurrencyIntoYen(spending)}</span>
              </p>
            )}
            <p className="font-semibold text-blue-dark">
              Net Total: {formatCurrencyIntoYen(netTotal)}
            </p>
          </div>
        )}
      </div>
      {receivableCount > 0 ? (
        <Link
          href={`/ledger-generator/${encodeURIComponent("売掛金")}`}
          className="mt-auto inline-flex justify-center rounded-3xl bg-blue-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-light"
        >
          Preview PDF
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="mt-auto rounded-3xl bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-600 cursor-not-allowed"
        >
          No Transactions
        </button>
      )}
    </div>
  );
}
