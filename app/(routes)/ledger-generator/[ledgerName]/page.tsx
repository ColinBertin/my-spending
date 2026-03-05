import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { notFound } from "next/navigation";
import LedgerPreviewTable from "../../../../components/LedgerPreviewTable";
import PrintLedgerPdfButton from "../../../../components/PrintLedgerPdfButton";
import { formatCurrencyIntoYen } from "../../../../helpers";
import {
  buildJournalLedgerPreviewRows,
  buildLedgerPreviewRows,
} from "../../../../lib/ledgerPreviewRows";
import { Category } from "../../../../types";
import {
  getCurrentJanuaryRange,
  getPreviousYearRange,
  getProfessionalLedgerContext,
  getTransactionsForRange,
  isAccruedExpenseTransaction,
} from "../data";

const JOURNAL_HEADER_TITLES = [
  "日          付\n伝票No\n生成元",
  "相手勘定科目\n相手補助科目",
  "摘　　要",
  "補　助　科　目\n\n借　方　金　額",
  "貸　方　金　額",
  "残　　高",
];

export const metadata = {
  title: "Ledger Preview",
};

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");
}

function getLedgerMeta(
  ledgerName: string,
  categories: Category[],
): {
  kind: "general" | "category" | "accountsReceivable" | "accruedExpenses";
  generalLedger: boolean;
  label: string;
  headerTitles?: string[];
} {
  if (ledgerName === "general-ledger") {
    return { kind: "general", generalLedger: true, label: "General Ledger" };
  }

  if (ledgerName === "売掛金") {
    return {
      kind: "accountsReceivable",
      generalLedger: false,
      label: "売掛金",
      headerTitles: JOURNAL_HEADER_TITLES,
    };
  }

  if (ledgerName === "未払費用") {
    return {
      kind: "accruedExpenses",
      generalLedger: false,
      label: "未払費用",
      headerTitles: JOURNAL_HEADER_TITLES,
    };
  }

  const category = categories.find((item) => item.name === ledgerName);

  if (!category) {
    notFound();
  }

  return {
    kind: "category",
    generalLedger: false,
    label: category.name,
  };
}

function sortTransactionsByDate(
  transactions: Parameters<typeof buildLedgerPreviewRows>[0],
) {
  return [...transactions].sort((a, b) => {
    const aDate = new Date(a.date).getTime();
    const bDate = new Date(b.date).getTime();
    if (aDate !== bDate) return aDate - bDate;
    return String(a.id).localeCompare(String(b.id));
  });
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
  const currentJanuary = getCurrentJanuaryRange();
  const ledgerMeta = getLedgerMeta(resolvedLedgerName, categories);
  const isSpecialLedger =
    ledgerMeta.kind === "accountsReceivable" ||
    ledgerMeta.kind === "accruedExpenses";
  const yearTransactions = await getTransactionsForRange(
    userId,
    categories,
    professionalAccountId,
    previousYear,
  );
  const januaryTransactions =
    ledgerMeta.kind === "category" || isSpecialLedger
      ? await getTransactionsForRange(
          userId,
          categories,
          professionalAccountId,
          currentJanuary,
        )
      : [];
  const yearEndAdjustmentDate = new Date(
    Date.UTC(previousYear.previousYear, 11, 31, 0, 0, 0),
  );
  const sortedJanuaryTransactions = sortTransactionsByDate(januaryTransactions);
  const previewTransactions =
    ledgerMeta.kind === "general"
      ? yearTransactions
      : ledgerMeta.kind === "category"
        ? [
            ...yearTransactions.filter(
              (tx) => tx.category_name === ledgerMeta.label,
            ),
            ...sortedJanuaryTransactions
              .filter((tx) => tx.category_name === ledgerMeta.label)
              .map((tx) => ({
                ...tx,
                date: new Date(yearEndAdjustmentDate),
              })),
          ]
        : ledgerMeta.kind === "accountsReceivable"
          ? sortedJanuaryTransactions.filter((tx) => tx.type === "income")
          : sortedJanuaryTransactions.filter(isAccruedExpenseTransaction);
  const rows =
    ledgerMeta.kind === "accountsReceivable"
      ? buildJournalLedgerPreviewRows(
          previewTransactions.map((transaction, index) => ({
            id: `entry-${transaction.id}`,
            transactionId: transaction.id,
            date: yearEndAdjustmentDate,
            voucherNo: index + 1,
            accountLabel: "売上高",
            description: transaction.title,
            debit: Number(transaction.amount) || 0,
          })),
          { balanceMode: "debit_increases" },
        )
      : ledgerMeta.kind === "accruedExpenses"
        ? buildJournalLedgerPreviewRows(
            previewTransactions.map((transaction, index) => ({
              id: `entry-${transaction.id}`,
              transactionId: transaction.id,
              date: yearEndAdjustmentDate,
              voucherNo: index + 1,
              accountLabel: transaction.category_name || "未分類",
              description: transaction.title,
              credit: Number(transaction.amount) || 0,
            })),
            { balanceMode: "credit_increases" },
          )
        : buildLedgerPreviewRows(previewTransactions, 0, {
            generalLedger: ledgerMeta.generalLedger,
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
  const periodLabel =
    ledgerMeta.kind === "general"
      ? String(previousYear.previousYear)
      : ledgerMeta.kind === "category"
        ? `${previousYear.previousYear} with January ${currentJanuary.currentYear} adjustments`
        : `January ${currentJanuary.currentYear}`;
  const fileName =
    ledgerMeta.kind === "general"
      ? `general_ledger_${previousYear.previousYear}.pdf`
      : `${sanitizeFileName(ledgerMeta.label)}_ledger_${
          ledgerMeta.kind === "category"
            ? previousYear.previousYear
            : currentJanuary.currentYear
        }.pdf`;
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
              <h1 className="flex flex-wrap items-center gap-2 text-3xl font-semibold text-red">
                <span>{ledgerMeta.label} Preview</span>
              </h1>
              <p className="text-sm text-gray-600">
                {isSpecialLedger ? "Adjustment preview" : "Full-year preview"}{" "}
                for {periodLabel}
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
          generalLedger={ledgerMeta.generalLedger}
          headerTitles={ledgerMeta.headerTitles}
        />
      </div>
    </div>
  );
}
