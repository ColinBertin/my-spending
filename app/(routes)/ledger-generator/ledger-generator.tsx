import Link from "next/link";
import { FinanceIcon } from "../../../components/FinanceIcon";
import TransactionFlowIcon from "../../../components/TransactionFlowIcon";
import { formatCurrencyIntoYen } from "../../../helpers";
import { Category, TransactionsByCategory } from "../../../types";

type LedgerGeneratorProps = {
  categoryPreviewTransactionsByCategory: TransactionsByCategory;
  categories: Category[];
  currentYear: number;
  januaryAccountsReceivableCount: number;
  januaryAccruedExpenseCount: number;
  previousYear: number;
  transactionsByCategory: TransactionsByCategory;
};

export default function LedgerGenerator({
  categoryPreviewTransactionsByCategory,
  categories,
  currentYear,
  januaryAccountsReceivableCount,
  januaryAccruedExpenseCount,
  previousYear,
  transactionsByCategory,
}: LedgerGeneratorProps) {
  const allTransactions = Object.values(transactionsByCategory).flat();
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const { totalIncome, totalSpending } = allTransactions.reduce(
    (totals, tx) => {
      const amount = Number(tx.amount) || 0;

      if (tx.type === "income") {
        totals.totalIncome += amount;
      } else {
        totals.totalSpending += amount;
      }

      return totals;
    },
    { totalIncome: 0, totalSpending: 0 },
  );
  const allTransactionsNetTotal = totalIncome - totalSpending;
  const hasGeneralIncome = totalIncome > 0;
  const hasGeneralSpending = totalSpending > 0;

  return (
    <div className="w-full max-w-full overflow-x-hidden px-4 sm:px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-5xl min-w-0 flex flex-col items-center">
        <div className="w-full rounded-2xl border border-blue-dark/20 bg-white p-4 sm:p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-center text-red mb-6">
            Ledger Generator ({previousYear})
          </h1>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Categories:{" "}
              <span className="font-semibold">{categories.length}</span>
            </p>
            <p className="text-sm text-gray-600">
              Transactions:{" "}
              <span className="font-semibold">{allTransactions.length}</span>
            </p>
          </div>

          <div className="mb-6 rounded-xl border border-blue-dark/20 bg-blue-50 p-4 flex flex-col gap-3">
            <h2 className="text-base font-semibold text-blue-dark">
              General Ledger
            </h2>
            <p className="text-sm text-gray-600">
              {allTransactions.length} transaction
              {allTransactions.length === 1 ? "" : "s"}
            </p>
            {(hasGeneralIncome || hasGeneralSpending) && (
              <div className="flex flex-col gap-2 text-sm text-gray-600">
                {hasGeneralIncome && (
                  <p className="flex items-center gap-2">
                    <TransactionFlowIcon type="income" className="h-6 w-6" />
                    <span>Income: {formatCurrencyIntoYen(totalIncome)}</span>
                  </p>
                )}
                {hasGeneralSpending && (
                  <p className="flex items-center gap-2">
                    <TransactionFlowIcon type="expense" className="h-6 w-6" />
                    <span>
                      Spending: {formatCurrencyIntoYen(totalSpending)}
                    </span>
                  </p>
                )}
                <p className="font-semibold text-blue-dark">
                  Net Total: {formatCurrencyIntoYen(allTransactionsNetTotal)}
                </p>
              </div>
            )}
            {allTransactions.length > 0 && (
              <Link
                href="/ledger-generator/general-ledger"
                className="mt-auto inline-flex justify-center rounded-3xl bg-blue-dark px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-light"
              >
                Preview PDF
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map((category) => {
              const categoryTransactions =
                categoryPreviewTransactionsByCategory[category.name] ?? [];
              const {
                totalIncome: categoryIncome,
                totalSpending: categorySpending,
              } = categoryTransactions.reduce(
                (totals, tx) => {
                  const amount = Number(tx.amount) || 0;

                  if (tx.type === "income") {
                    totals.totalIncome += amount;
                  } else {
                    totals.totalSpending += amount;
                  }

                  return totals;
                },
                { totalIncome: 0, totalSpending: 0 },
              );
              const total = categoryIncome - categorySpending;
              const hasCategoryIncome = categoryIncome > 0;
              const hasCategorySpending = categorySpending > 0;
              return (
                <div
                  key={category.id}
                  className="rounded-xl border border-blue-dark/20 bg-gray-50 p-4 flex flex-col gap-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold text-blue-dark leading-6">
                        {category.name}
                      </h2>
                      {category.icon &&
                        category.icon_pack &&
                        category.color && (
                          <FinanceIcon
                            icon={category.icon}
                            iconPack={category.icon_pack}
                            iconColor={category.color}
                            className="w-9 h-9 p-1.5 border border-blue-dark/20 rounded-full bg-white shrink-0"
                          />
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {categoryTransactions.length} transaction
                      {categoryTransactions.length === 1 ? "" : "s"}
                    </p>
                    {(hasCategoryIncome || hasCategorySpending) && (
                      <div className="mt-2 flex flex-col gap-1 text-sm text-gray-600">
                        {hasCategoryIncome && (
                          <p className="flex items-center gap-2">
                            <TransactionFlowIcon
                              type="income"
                              className="h-6 w-6"
                            />
                            <span>
                              Income: {formatCurrencyIntoYen(categoryIncome)}
                            </span>
                          </p>
                        )}
                        {hasCategorySpending && (
                          <p className="flex items-center gap-2">
                            <TransactionFlowIcon
                              type="expense"
                              className="h-6 w-6"
                            />
                            <span>
                              Spending:{" "}
                              {formatCurrencyIntoYen(categorySpending)}
                            </span>
                          </p>
                        )}
                        <p className="font-semibold text-blue-dark">
                          Net Total: {formatCurrencyIntoYen(total)}
                        </p>
                      </div>
                    )}
                  </div>
                  {categoryTransactions.length > 0 ? (
                    <Link
                      href={`/ledger-generator/${encodeURIComponent(category.name)}`}
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
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-blue-dark/20 bg-white p-4 sm:p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-blue-dark">
                January {currentYear} Adjustments
              </h2>
              <p className="text-sm text-gray-600">
                Special ledgers listed separately from the general ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-blue-dark/20 bg-gray-50 p-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-semibold text-blue-dark leading-6">
                    売掛金
                  </h3>
                  <p className="text-sm text-gray-600">
                    January {currentYear} adjustment
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {januaryAccountsReceivableCount} transaction
                    {januaryAccountsReceivableCount === 1 ? "" : "s"}
                  </p>
                </div>
                {januaryAccountsReceivableCount > 0 ? (
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

              <div className="rounded-xl border border-blue-dark/20 bg-gray-50 p-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-base font-semibold text-blue-dark leading-6">
                    未払費用
                  </h3>
                  <p className="text-sm text-gray-600">
                    January {currentYear} adjustment
                  </p>
                  <p className="mt-2 text-sm text-gray-600">
                    {januaryAccruedExpenseCount} transaction
                    {januaryAccruedExpenseCount === 1 ? "" : "s"}
                  </p>
                </div>
                {januaryAccruedExpenseCount > 0 ? (
                  <Link
                    href={`/ledger-generator/${encodeURIComponent("未払費用")}`}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
