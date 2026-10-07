import { notFound } from "next/navigation";
import type { LedgerPreviewContent } from "@/components/LedgerPreview";
import { sumIncomeAndSpending } from "@/helpers";
import {
  buildJournalLedgerPreviewRows,
  buildLedgerPreviewRows,
} from "@/lib/ledgerPreviewRows";
import { Category } from "@/types";
import { requirePageUser } from "@/utils/supabase/requireUser";
import {
  getCurrentJanuaryRange,
  getPreviousYearRange,
  getProfessionalLedgerContext,
  getTransactionsForRange,
  isJanuaryAdjustmentCategoryLedgerName,
  isAccruedExpenseTransaction,
} from "./data";

export const GENERAL_LEDGER_NAME = "general-ledger";

const JOURNAL_HEADER_TITLES = [
  "日          付\n伝票No\n生成元",
  "相手勘定科目\n相手補助科目",
  "摘　　要",
  "補　助　科　目\n\n借　方　金　額",
  "貸　方　金　額",
  "残　　高",
];

type LedgerKind =
  | "general"
  | "category"
  | "accountsReceivable"
  | "accruedExpenses";

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
  kind: LedgerKind;
  generalLedger: boolean;
  label: string;
  headerTitles?: string[];
} {
  if (ledgerName === GENERAL_LEDGER_NAME) {
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
    if (aDate !== bDate) {
      return aDate - bDate;
    }
    return String(a.id).localeCompare(String(b.id));
  });
}

function getLedgerTitle(kind: LedgerKind, label: string) {
  if (kind === "general") {
    return "総勘定元帳 · General ledger";
  }
  if (kind === "category") {
    return `${label} · Category ledger`;
  }
  return `${label} · January adjustment`;
}

// The account id comes from the user's own `account_members` row
// (see getProfessionalLedgerContext), so membership is already verified.
export async function getProfessionalAccountName(
  professionalAccountId: string | null,
) {
  if (!professionalAccountId) {
    return null;
  }

  const { supabase } = await requirePageUser();
  const { data, error } = await supabase
    .from("accounts")
    .select("name")
    .eq("id", professionalAccountId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.name as string | undefined) ?? null;
}

export async function getLedgerPreview(
  ledgerName: string,
): Promise<LedgerPreviewContent> {
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
  const shouldIncludeNextJanuaryForCategoryLedger =
    ledgerMeta.kind === "category" &&
    isJanuaryAdjustmentCategoryLedgerName(ledgerMeta.label);
  const [accountName, yearTransactions] = await Promise.all([
    getProfessionalAccountName(professionalAccountId),
    getTransactionsForRange(
      userId,
      categories,
      professionalAccountId,
      previousYear,
    ),
  ]);
  const januaryTransactions =
    shouldIncludeNextJanuaryForCategoryLedger || isSpecialLedger
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
        ? shouldIncludeNextJanuaryForCategoryLedger
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
          : yearTransactions.filter(
              (tx) => tx.category_name === ledgerMeta.label,
            )
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
  const { totalIncome, totalSpending } =
    sumIncomeAndSpending(previewTransactions);
  const fiscalYearLabel = `FY${previousYear.previousYear}`;
  const januaryLabel = `Jan ${currentJanuary.currentYear}`;
  const periodLabel =
    ledgerMeta.kind === "general"
      ? fiscalYearLabel
      : ledgerMeta.kind === "category"
        ? shouldIncludeNextJanuaryForCategoryLedger
          ? `${fiscalYearLabel} + ${januaryLabel} adjustments`
          : fiscalYearLabel
        : januaryLabel;
  const fileName =
    ledgerMeta.kind === "general"
      ? `general_ledger_${previousYear.previousYear}.pdf`
      : `${sanitizeFileName(ledgerMeta.label)}_ledger_${
          ledgerMeta.kind === "category"
            ? previousYear.previousYear
            : currentJanuary.currentYear
        }.pdf`;

  return {
    title: getLedgerTitle(ledgerMeta.kind, ledgerMeta.label),
    subtitle: [accountName ?? "Professional account", periodLabel, "JPY"]
      .join(" · ")
      .toUpperCase(),
    rows,
    transactions: previewTransactions,
    categories,
    headerTitles: ledgerMeta.headerTitles,
    amountLabels: ledgerMeta.headerTitles
      ? { income: "借方金額", expense: "貸方金額" }
      : { income: "収入金額", expense: "支出金額" },
    totalIncome,
    totalSpending,
    fileName,
  };
}
