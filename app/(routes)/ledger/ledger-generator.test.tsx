import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Category, Transaction } from "@/types";
import LedgerGenerator from "./ledger-generator";

const categories = [
  { id: "c1", name: "売上高", type: "professional", color: "rose" },
  { id: "c2", name: "消耗品費", type: "professional", color: "sky" },
] as Category[];

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "t",
    title: "Entry",
    type: "expense",
    category_name: "消耗品費",
    amount: 100,
    currency: "JPY",
    date: new Date("2025-03-01T00:00:00.000Z"),
    ...overrides,
  };
}

const income = tx({
  id: "t1",
  type: "income",
  category_name: "売上高",
  amount: 5000,
});

function render(
  overrides: Partial<Parameters<typeof LedgerGenerator>[0]> = {},
) {
  return renderToStaticMarkup(
    <LedgerGenerator
      categoryPreviewTransactionsByCategory={{ 売上高: [income], 消耗品費: [] }}
      categories={categories}
      currentYear={2026}
      hasProfessionalAccount
      januaryAccountsReceivableCount={0}
      januaryAccountsReceivableIncome={0}
      januaryAccountsReceivableSpending={0}
      januaryAccruedExpenseCount={2}
      januaryAccruedExpenseIncome={0}
      januaryAccruedExpenseSpending={900}
      previousYear={2025}
      professionalAccountName="Studio Pro"
      transactionsByCategory={{
        売上高: [income],
        消耗品費: [tx({ id: "t2", amount: 300 })],
      }}
      {...overrides}
    />,
  );
}

describe("LedgerGenerator", () => {
  it("renders the general ledger card with fiscal-year totals", () => {
    const html = render();

    expect(html).toContain("Generate ledger");
    expect(html).toContain("Studio Pro");
    expect(html).toContain("2025");
    expect(html).toContain('href="/ledger/general-ledger"');
    expect(html).toContain("2 entries");
    expect(html).toMatch(/[¥￥]5,000/);
    expect(html).toMatch(/[¥￥]300/);
    expect(html).toMatch(/[¥￥]4,700/);
    expect(html).not.toContain("No professional account");
  });

  it("lists every category and only links categories with entries", () => {
    const html = render();

    expect(html).toContain(`href="/ledger/${encodeURIComponent("売上高")}"`);
    expect(html).not.toContain(
      `href="/ledger/${encodeURIComponent("消耗品費")}"`,
    );
    expect(html).toContain("消耗品費");
    expect(html).toContain("売上高, 水道光熱費, 通信費");
  });

  it("links each January adjustment to its own ledger", () => {
    const html = render();

    expect(html).toContain(`href="/ledger/${encodeURIComponent("未払費用")}"`);
    expect(html).not.toContain(
      `href="/ledger/${encodeURIComponent("売掛金")}"`,
    );
    expect(html).toMatch(/NET -[¥￥]900/);
  });

  it("prompts to create a professional account when there is none", () => {
    const html = render({
      hasProfessionalAccount: false,
      professionalAccountName: null,
      categoryPreviewTransactionsByCategory: {},
      categories: [],
      transactionsByCategory: {},
      januaryAccruedExpenseCount: 0,
    });

    expect(html).toContain("No professional account");
    expect(html).toContain('href="/accounts/create"');
    expect(html).toContain('href="/categories/create"');
    expect(html).not.toContain('href="/ledger/general-ledger"');
  });
});
