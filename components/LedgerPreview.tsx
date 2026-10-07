import Link from "next/link";
import LedgerPreviewTable from "@/components/LedgerPreviewTable";
import PrintLedgerPdfButton from "@/components/PrintLedgerPdfButton";
import StatTile from "@/components/StatTile";
import PageLayout from "@/components/ui/PageLayout";
import { formatCurrencyIntoYen, getLedgerEndingBalance } from "@/helpers";
import { LedgerPreviewRow } from "@/lib/ledgerPreviewRows";
import { Category, Transaction } from "@/types";

export type LedgerPreviewContent = {
  title: string;
  subtitle: string;
  rows: LedgerPreviewRow[];
  transactions: Transaction[];
  categories: Category[];
  headerTitles?: string[];
  amountLabels: { income: string; expense: string };
  totalIncome: number;
  totalSpending: number;
  fileName: string;
};

type LedgerPreviewProps = LedgerPreviewContent & {
  backHref: string;
  backLabel: string;
  autoDownload?: boolean;
};

export default function LedgerPreview({
  title,
  subtitle,
  rows,
  transactions,
  categories,
  headerTitles,
  amountLabels,
  totalIncome,
  totalSpending,
  fileName,
  backHref,
  backLabel,
  autoDownload = false,
}: LedgerPreviewProps) {
  const hasEntries = transactions.length > 0;

  return (
    <PageLayout className="ledger-preview-page">
      <div className="ledger-preview-inner flex min-w-0 flex-col gap-4">
        <div className="ledger-preview-header print-hidden flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-[14px]">
            <div className="min-w-0">
              <Link
                href={backHref}
                className="text-[12px] leading-none font-medium text-[#5C5952] hover:text-[#17161A] md:hidden"
              >
                ← {backLabel}
              </Link>
              <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
                {title}
              </h1>
              <p className="mt-2 font-mono text-[11px] leading-none text-[#5C5952]">
                {subtitle}
              </p>
            </div>
            {hasEntries && (
              <div className="flex flex-wrap gap-2">
                <PrintLedgerPdfButton
                  documentTitle={fileName}
                  autoStart={autoDownload}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] lg:grid-cols-4">
            <StatTile size="sm" label="Entries" value={transactions.length} />
            <StatTile
              size="sm"
              label={amountLabels.income}
              value={formatCurrencyIntoYen(totalIncome)}
              valueClassName="text-[#0E7C66]"
            />
            <StatTile
              size="sm"
              label={amountLabels.expense}
              value={formatCurrencyIntoYen(totalSpending)}
              valueClassName="text-[#B0442A]"
            />
            <StatTile
              size="sm"
              label="残高"
              value={formatCurrencyIntoYen(getLedgerEndingBalance(rows))}
            />
          </div>

          {!hasEntries && (
            <p className="rounded-[12px] border border-[#E3DFD7] bg-[#FBFAF7] px-4 py-[14px] text-[12px] leading-[1.6] text-[#6B6760]">
              No entries recorded for this period yet. Transactions added to
              your professional account will show up here.
            </p>
          )}
        </div>

        <LedgerPreviewTable
          rows={rows}
          transactions={transactions}
          categories={categories}
          headerTitles={headerTitles}
        />
      </div>
    </PageLayout>
  );
}
