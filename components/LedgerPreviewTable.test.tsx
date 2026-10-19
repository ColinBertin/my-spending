import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { buildLedgerPreviewRows } from "@/lib/ledgerPreviewRows";
import { Transaction } from "@/types";
import LedgerPreviewTable from "./LedgerPreviewTable";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("./ui/NotificationProvider", () => ({
  useSuccessNotification: () => vi.fn(),
  useErrorNotification: () => vi.fn(),
}));

vi.mock("./Modal", () => ({
  default: () => null,
  ModalTitleText: () => null,
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
    note: "Studio",
    type: "expense",
    category_name: "水道光熱費",
    amount: 1200,
    currency: "JPY",
    date: new Date("2025-01-09T00:00:00.000Z"),
  },
];

function render() {
  return renderToStaticMarkup(
    <LedgerPreviewTable
      rows={buildLedgerPreviewRows(transactions, 0, { generalLedger: true })}
      transactions={transactions}
      categories={[]}
    />,
  );
}

function count(html: string, needle: string) {
  return html.split(needle).length - 1;
}

describe("LedgerPreviewTable", () => {
  it("keeps the print-only table and hides the screen views from print", () => {
    const html = render();

    expect(html).toContain('class="print-only');
    expect(html).toContain("ledger-preview-table-wrap print-hidden");
    expect(html).toContain("border border-black");
    expect(html).not.toContain("前期より繰越");
    expect(html).toContain("１月度　合計");
    expect(html).toContain("翌期へ繰越");
  });

  it("renders edit/delete actions only for transaction rows, in table and cards", () => {
    const html = render();

    expect(count(html, 'aria-label="Update Consulting"')).toBe(2);
    expect(count(html, 'aria-label="Delete Electricity"')).toBe(2);
    expect(count(html, 'aria-label="Update ')).toBe(4);
    expect(html).toContain("操作");
  });

  it("splits the date label and formats signed amounts on mobile cards", () => {
    const html = render();

    expect(html).toContain("1/5 · No.1");
    expect(html).toContain("1/9 · No.2");
    expect(html).toContain("Electricity / Studio");
    expect(html).toMatch(/\+[¥￥]5,000/);
    expect(html).toMatch(/−[¥￥]1,200/);
    expect(html).toMatch(/残 [¥￥]3,800/);
  });
});
