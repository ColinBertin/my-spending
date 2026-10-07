import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { buildLedgerPreviewRows } from "@/lib/ledgerPreviewRows";
import { Transaction } from "@/types";
import LedgerPreview, { LedgerPreviewContent } from "./LedgerPreview";

vi.mock("./LedgerPreviewTable", () => ({
  default: ({ rows }: { rows: unknown[] }) => (
    <div>Mock table ({rows.length} rows)</div>
  ),
}));

vi.mock("./PrintLedgerPdfButton", () => ({
  default: ({
    documentTitle,
    autoStart,
  }: {
    documentTitle: string;
    autoStart?: boolean;
  }) => (
    <button>
      Print {documentTitle} {autoStart ? "auto" : "manual"}
    </button>
  ),
}));

const transactions: Transaction[] = [
  {
    id: "t1",
    title: "Consulting",
    type: "income",
    category_name: "売上高",
    amount: 5000,
    currency: "JPY",
    date: new Date("2025-01-05T00:00:00.000Z"),
  },
  {
    id: "t2",
    title: "Electricity",
    type: "expense",
    category_name: "水道光熱費",
    amount: 1200,
    currency: "JPY",
    date: new Date("2025-01-09T00:00:00.000Z"),
  },
];

function content(
  overrides: Partial<LedgerPreviewContent> = {},
): LedgerPreviewContent {
  return {
    title: "総勘定元帳 · General ledger",
    subtitle: "STUDIO PRO · FY2025 · JPY",
    rows: buildLedgerPreviewRows(transactions, 0, { generalLedger: true }),
    transactions,
    categories: [],
    amountLabels: { income: "収入金額", expense: "支出金額" },
    totalIncome: 5000,
    totalSpending: 1200,
    fileName: "general_ledger_2025.pdf",
    ...overrides,
  };
}

describe("LedgerPreview", () => {
  it("renders the header, stats and print action", () => {
    const html = renderToStaticMarkup(
      <LedgerPreview
        {...content()}
        backHref="/ledger"
        backLabel="Ledger generator"
        autoDownload
      />,
    );

    expect(html).toContain("ledger-preview-page");
    expect(html).toContain("ledger-preview-header");
    expect(html).toContain('href="/ledger"');
    expect(html).toContain("← Ledger generator");
    expect(html).toContain("総勘定元帳 · General ledger");
    expect(html).toContain("STUDIO PRO · FY2025 · JPY");
    expect(html).toContain("収入金額");
    expect(html).toContain("支出金額");
    expect(html).toContain("5,000");
    // 残高 is the running balance after the last entry, before closing.
    expect(html).toContain("残高");
    expect(html).toContain("3,800");
    expect(html).toContain("Print general_ledger_2025.pdf auto");
    expect(html).toContain("Mock table");
    expect(html).not.toContain("No entries recorded");
  });

  it("hides the print action and explains an empty ledger", () => {
    const html = renderToStaticMarkup(
      <LedgerPreview
        {...content({
          rows: buildLedgerPreviewRows([], 0, { generalLedger: true }),
          transactions: [],
          totalIncome: 0,
          totalSpending: 0,
        })}
        backHref="/ledger"
        backLabel="Ledger generator"
      />,
    );

    expect(html).not.toContain("Print ");
    expect(html).toContain("No entries recorded for this period yet.");
  });
});
