import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { notFound } from "next/navigation";
import LedgerPreviewTable from "../../../../components/LedgerPreviewTable";
import PrintLedgerPdfButton from "../../../../components/PrintLedgerPdfButton";
import { formatCurrencyIntoYen } from "../../../../helpers";
import { buildLedgerPreviewRows } from "../../../../lib/ledgerPreviewRows";
import { Category } from "../../../../types";
import {
  getPreviousYearRange,
  getProfessionalLedgerContext,
  getTransactionsForRange,
} from "../data";

export const metadata = {
  title: "Ledger Preview",
};

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");
}

function getLedgerLabel(
  ledgerName: string,
  categories: Category[],
): { generalLedger: boolean; label: string } {
  if (ledgerName === "general-ledger") {
    return { generalLedger: true, label: "General Ledger" };
  }

  const category = categories.find((item) => item.name === ledgerName);

  if (!category) {
    notFound();
  }

  return {
    generalLedger: false,
    label: category.name,
  };
}

export default async function LedgerPreviewPage({
  params,
  searchParams,
}: {
  params: { ledgerName: string };
  searchParams: { download?: string };
}) {
  const { ledgerName } = await params;
  const resolvedSearchParams = await searchParams;
  const resolvedLedgerName = (() => {
    try {
      return decodeURIComponent(ledgerName);
    } catch {
      return ledgerName;
    }
  })();
  const { userId, professionalAccountId, categories } =
    await getProfessionalLedgerContext();
  const previousYear = getPreviousYearRange();
  const transactions = await getTransactionsForRange(
    userId,
    categories,
    professionalAccountId,
    previousYear,
  );
  const { generalLedger, label } = getLedgerLabel(
    resolvedLedgerName,
    categories,
  );
  const previewTransactions = generalLedger
    ? transactions
    : transactions.filter((tx) => tx.category_name === label);
  const rows = buildLedgerPreviewRows(previewTransactions, 0, {
    generalLedger,
  });
  const { totalIncome, totalExpense } = previewTransactions.reduce(
    (totals, tx) => {
      const amount = Number(tx.amount) || 0;

      if (tx.type === "income") {
        totals.totalIncome += amount;
      } else {
        totals.totalExpense += amount;
      }

      return totals;
    },
    { totalIncome: 0, totalExpense: 0 },
  );
  const periodLabel = String(previousYear.previousYear);
  const fileName = generalLedger
    ? `general_ledger_${previousYear.previousYear}.pdf`
    : `ledger_${previousYear.previousYear}_${sanitizeFileName(label)}.pdf`;
  const autoDownload = resolvedSearchParams.download === "1";

  return (
    <div className="ledger-preview-page w-full max-w-full overflow-x-hidden px-4 sm:px-6 pt-24 pb-12">
      <div className="ledger-preview-inner mx-auto w-full max-w-7xl min-w-0 flex flex-col gap-6">
        <div className="ledger-preview-header rounded-2xl border border-blue-dark/20 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Link
                href="/ledger-generator"
                className="print-hidden inline-flex items-center gap-1 text-sm font-medium text-blue-dark hover:text-blue-light"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Ledger Generator
              </Link>
              <h1 className="text-3xl font-semibold text-red">
                {label} Preview
              </h1>
              <p className="text-sm text-gray-600">
                Full-year preview for {periodLabel}
              </p>
            </div>
            <div className="w-full max-w-sm space-y-3">
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-blue-dark/10 bg-gray-50 p-3 text-sm">
                <div>
                  <p className="text-gray-500">Transactions</p>
                  <p className="font-semibold text-blue-dark">
                    {previewTransactions.length}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Income</p>
                  <p className="font-semibold text-blue-dark">
                    {formatCurrencyIntoYen(totalIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Spending</p>
                  <p className="font-semibold text-blue-dark">
                    {formatCurrencyIntoYen(totalExpense)}
                  </p>
                </div>
              </div>
              {previewTransactions.length > 0 && (
                <div className="print-hidden">
                  <PrintLedgerPdfButton
                    documentTitle={fileName}
                    label="Download PDF"
                    autoStart={autoDownload}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <LedgerPreviewTable
          rows={rows}
          transactions={previewTransactions}
          categories={categories}
        />
      </div>
    </div>
  );
}
