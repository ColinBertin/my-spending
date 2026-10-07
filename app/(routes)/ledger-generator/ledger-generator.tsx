import Link from "next/link";
import LedgerGeneratorCard from "@/components/LedgerGeneratorCard";
import LedgerSourceRow from "@/components/LedgerSourceRow";
import { Button } from "@/components/ui/button";
import PageLayout from "@/components/ui/PageLayout";
import { formatCurrencyIntoYen, sumIncomeAndSpending } from "@/helpers";
import { Category, TransactionsByCategory } from "@/types";
import { resolveCategoryHex } from "../categories/category-cards";
import { CATEGORY_LEDGER_JANUARY_ADJUSTMENT_TARGETS } from "./data";
import { GENERAL_LEDGER_NAME } from "./ledger-preview";

type LedgerGeneratorProps = {
  categoryPreviewTransactionsByCategory: TransactionsByCategory;
  categories: Category[];
  currentYear: number;
  hasProfessionalAccount: boolean;
  januaryAccountsReceivableCount: number;
  januaryAccountsReceivableIncome: number;
  januaryAccountsReceivableSpending: number;
  januaryAccruedExpenseCount: number;
  januaryAccruedExpenseIncome: number;
  januaryAccruedExpenseSpending: number;
  previousYear: number;
  professionalAccountName: string | null;
  transactionsByCategory: TransactionsByCategory;
};

const fieldLabelClassName =
  "mb-[7px] block text-[11px] leading-none font-medium text-[#6B6760]";
const fieldValueClassName =
  "flex h-[42px] items-center rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] leading-none";
const listClassName =
  "relative max-h-[264px] divide-y divide-[#F1EEE8] overflow-y-auto overscroll-contain border-t border-[#F1EEE8]";

export default function LedgerGenerator({
  categoryPreviewTransactionsByCategory,
  categories,
  currentYear,
  hasProfessionalAccount,
  januaryAccountsReceivableCount,
  januaryAccountsReceivableIncome,
  januaryAccountsReceivableSpending,
  januaryAccruedExpenseCount,
  januaryAccruedExpenseIncome,
  januaryAccruedExpenseSpending,
  previousYear,
  professionalAccountName,
  transactionsByCategory,
}: LedgerGeneratorProps) {
  const allTransactions = Object.values(transactionsByCategory).flat();
  const sortedCategories = [...categories].sort((a, b) =>
    a.name.localeCompare(b.name),
  );
  const { totalIncome, totalSpending } = sumIncomeAndSpending(allTransactions);
  const allTransactionsNetTotal = totalIncome - totalSpending;
  const januaryTargets = Array.from(
    CATEGORY_LEDGER_JANUARY_ADJUSTMENT_TARGETS,
  ).join(", ");

  const adjustments = [
    {
      ledgerName: "売掛金",
      label: "売掛金 · Accounts receivable",
      entries: januaryAccountsReceivableCount,
      netTotal:
        januaryAccountsReceivableIncome - januaryAccountsReceivableSpending,
    },
    {
      ledgerName: "未払費用",
      label: "未払費用 · Accrued expenses",
      entries: januaryAccruedExpenseCount,
      netTotal: januaryAccruedExpenseIncome - januaryAccruedExpenseSpending,
    },
  ];

  const generalStats = [
    {
      label: "Income",
      value: formatCurrencyIntoYen(totalIncome),
      className: "text-[#0E7C66]",
    },
    {
      label: "Spending",
      value: formatCurrencyIntoYen(totalSpending),
      className: "text-[#B0442A]",
    },
    {
      label: "Net",
      value: formatCurrencyIntoYen(allTransactionsNetTotal),
      className: "text-[#17161A]",
    },
  ];

  return (
    <PageLayout>
      <div>
        <span className="inline-flex items-center rounded-full border border-[#F3CFC3] bg-[#FCEDE8] px-[11px] py-[5px] font-mono text-[10px] leading-none font-medium tracking-[0.12em] text-[#B0442A] uppercase">
          Pro tools
        </span>
        <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-[10px] md:text-[27px]">
          Generate ledger
        </h1>
        <p className="mt-2 max-w-[56ch] text-[13px] leading-[1.6] text-[#6B6760]">
          Accounting-ready 総勘定元帳 built from your recorded transactions.
          Preview on screen, then print to PDF.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-[14px] rounded-[12px] border border-[#E3DFD7] bg-white p-[18px] md:grid-cols-3">
          <div>
            <span className={fieldLabelClassName}>Account</span>
            <div className={fieldValueClassName}>
              <span className="truncate">
                {professionalAccountName ??
                  (hasProfessionalAccount
                    ? "Professional account"
                    : "No professional account")}
              </span>
            </div>
          </div>
          <div>
            <span className={fieldLabelClassName}>Fiscal year</span>
            <div className={`${fieldValueClassName} font-mono`}>
              {previousYear}
            </div>
          </div>
          <div>
            <span className={fieldLabelClassName}>Currency</span>
            <div className={`${fieldValueClassName} font-mono`}>JPY</div>
          </div>
        </div>

        {!hasProfessionalAccount && (
          <div className="mt-[14px] flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#E3DFD7] bg-white px-4 py-[14px]">
            <p className="max-w-[60ch] text-[12px] leading-[1.6] text-[#6B6760]">
              Ledgers are built from a professional account. Create one to start
              recording entries for 元帳 export.
            </p>
            <Button
              asChild
              variant="outline"
              className="h-9 rounded-[9px] px-[13px] text-[12px]"
            >
              <Link href="/accounts/create">New account</Link>
            </Button>
          </div>
        )}

        <div className="mt-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-3">
          <LedgerGeneratorCard
            markColor="#17161A"
            eyebrow="総勘定元帳"
            title="General ledger"
            description={`Every entry for FY${previousYear}, ordered by date with running balance and monthly subtotals.`}
            action={
              allTransactions.length > 0 ? (
                <Button
                  asChild
                  className="h-9 rounded-[9px] px-[14px] text-[12px]"
                >
                  <Link href={`/ledger-generator/${GENERAL_LEDGER_NAME}`}>
                    Preview
                  </Link>
                </Button>
              ) : (
                <Button
                  type="button"
                  disabled
                  className="h-9 rounded-[9px] px-[14px] text-[12px]"
                >
                  No entries
                </Button>
              )
            }
          >
            <p className="font-mono text-[10px] leading-none tracking-[0.12em] text-[#5C5952] uppercase">
              {allTransactions.length}{" "}
              {allTransactions.length === 1 ? "entry" : "entries"}
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-2">
              {generalStats.map((stat) => (
                <div key={stat.label} className="min-w-0">
                  <dt className="text-[11px] leading-none text-[#6B6760]">
                    {stat.label}
                  </dt>
                  <dd
                    className={`mt-[6px] truncate font-mono text-[13px] leading-none font-medium tabular-nums ${stat.className}`}
                  >
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </LedgerGeneratorCard>

          <LedgerGeneratorCard
            markColor="#E8552F"
            eyebrow="科目別元帳"
            title="Category ledger"
            description={`One ledger per professional category, each with its own carry-forward. ${januaryTargets} also include January ${currentYear} adjustments.`}
          >
            {sortedCategories.length === 0 ? (
              <p className="border-t border-[#F1EEE8] pt-3 text-[12px] leading-[1.6] text-[#6B6760]">
                No professional categories yet.{" "}
                <Link
                  href="/categories/create"
                  className="font-medium text-[#B04124] hover:text-[#8A331B]"
                >
                  Add one
                </Link>
              </p>
            ) : (
              <div className={listClassName}>
                {sortedCategories.map((category) => {
                  const categoryTransactions =
                    categoryPreviewTransactionsByCategory[category.name] ?? [];
                  const {
                    totalIncome: categoryIncome,
                    totalSpending: categorySpending,
                  } = sumIncomeAndSpending(categoryTransactions);

                  return (
                    <LedgerSourceRow
                      key={category.id}
                      ledgerName={category.name}
                      entries={categoryTransactions.length}
                      netTotal={categoryIncome - categorySpending}
                      markColor={resolveCategoryHex(category.color)}
                    />
                  );
                })}
              </div>
            )}
          </LedgerGeneratorCard>

          <LedgerGeneratorCard
            markColor="#0E7C66"
            eyebrow="1月調整仕訳"
            title="January adjustment"
            description={`Entries from January ${currentYear} posted to 12/31/${previousYear}: receivables and accrued expenses.`}
          >
            <div className={listClassName}>
              {adjustments.map((adjustment) => (
                <LedgerSourceRow key={adjustment.ledgerName} {...adjustment} />
              ))}
            </div>
          </LedgerGeneratorCard>
        </div>

        <div className="mt-[14px] flex items-start gap-[11px] rounded-[12px] border border-[#E3DFD7] bg-[#FBFAF7] px-4 py-[14px]">
          <span
            aria-hidden
            className="mt-[6px] h-[6px] w-[6px] flex-none rounded-full bg-[#E8552F]"
          />
          <p className="text-[12px] leading-[1.6] text-[#6B6760]">
            <span className="font-mono text-[#3B3934]">FY{previousYear}</span> ·{" "}
            {allTransactions.length}{" "}
            {allTransactions.length === 1 ? "entry" : "entries"} · net{" "}
            <span className="font-mono text-[#3B3934]">
              {formatCurrencyIntoYen(allTransactionsNetTotal)}
            </span>
            . Edits made in preview write back to the transaction record.
          </p>
        </div>
      </div>
    </PageLayout>
  );
}
