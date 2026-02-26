import { DownloadLedgerXlsxButton } from "@/components/DownloadLedgerXlsxButton";
import { FinanceIcon } from "@/components/FinanceIcon";
import { formatCurrencyIntoYen } from "@/helpers";
import { Category, TransactionsByCategory } from "@/types";

type LedgerGeneratorProps = {
  categories: Category[];
  previousYear: number;
  transactionsByCategory: TransactionsByCategory;
};

export default function LedgerGenerator({
  categories,
  previousYear,
  transactionsByCategory,
}: LedgerGeneratorProps) {
  const allTransactions = Object.values(transactionsByCategory).flat();
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const sanitizeFileName = (value: string) =>
    value
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "_");
  const generalLedgerFileName = `general_ledger_${previousYear}.xlsx`;
  const allTransactionsTotal = allTransactions.reduce(
    (sum, tx) => sum + Number(tx.amount || 0),
    0,
  );

  return (
    <div className="w-full px-4 sm:px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-3xl font-semibold text-center text-red mb-8">
          Ledger Generator ({previousYear})
        </h1>

        <div className="w-full rounded-2xl border border-blue-dark/20 bg-white p-4 sm:p-6 shadow-sm">
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
            <p className="text-sm text-gray-600">
              {formatCurrencyIntoYen(allTransactionsTotal)}
            </p>
            <DownloadLedgerXlsxButton
              transactions={allTransactions}
              fileName={generalLedgerFileName}
              label={
                allTransactions.length > 0
                  ? "Generate General Ledger"
                  : "No Transactions"
              }
              disabled={allTransactions.length === 0}
              generalLedger
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedCategories.map((category) => {
              const categoryTransactions =
                transactionsByCategory[category.name] ?? [];
              const total = categoryTransactions.reduce(
                (sum, tx) => sum + Number(tx.amount || 0),
                0,
              );
              const fileName = `ledger_${previousYear}_${sanitizeFileName(category.name)}.xlsx`;

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
                    <p className="text-sm text-gray-600">
                      {formatCurrencyIntoYen(total)}
                    </p>
                  </div>

                  <DownloadLedgerXlsxButton
                    transactions={categoryTransactions}
                    fileName={fileName}
                    label={
                      categoryTransactions.length > 0
                        ? "Generate Excel"
                        : "No Transactions"
                    }
                    disabled={categoryTransactions.length === 0}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
