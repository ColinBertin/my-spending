import { describe, expect, it } from "vitest";
import type { Transaction } from "@/types";
import { buildLedgerPreviewRows } from "./ledgerPreviewRows";

describe("buildLedgerPreviewRows", () => {
  it("builds category ledger rows with carry, monthly subtotal and total", () => {
    const transactions: Transaction[] = [
      {
        id: "2",
        title: "Taxi",
        type: "expense",
        category_name: "Travel",
        amount: 40,
        currency: "JPY",
        date: new Date("2025-01-01T12:00:00.000Z"),
      },
      {
        id: "1",
        title: "Salary",
        type: "income",
        category_name: "Income",
        amount: 100,
        currency: "JPY",
        date: new Date("2025-01-01T00:00:00.000Z"),
      },
    ];

    const rows = buildLedgerPreviewRows(transactions, 50);

    expect(rows).toHaveLength(5);
    expect(rows[0]).toMatchObject({
      kind: "carry",
      description: "前期より繰越",
      balance: 50,
    });
    expect(rows[1]).toMatchObject({
      kind: "entry",
      transactionId: "1",
      dateLabel: "1/1\n1",
      accountLabel: "現金",
      income: 100,
      balance: 150,
    });
    expect(rows[2]).toMatchObject({
      kind: "entry",
      dateLabel: "\n2",
      accountLabel: "現金",
      expense: 40,
      balance: 110,
    });
    expect(rows[3]).toMatchObject({
      kind: "subtotal",
      description: "１月度　合計",
      income: 100,
      expense: 40,
    });
    expect(rows[4]).toMatchObject({
      kind: "footer",
      description: "当期累計",
      income: 100,
      expense: 40,
      balance: 110,
    });
  });

  it("adds the closing entry and 3-row footer in general ledger mode", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        title: "Lunch",
        type: "expense",
        category_name: "",
        amount: 15,
        currency: "JPY",
        date: new Date("2025-03-05T00:00:00.000Z"),
        note: "with client",
      },
    ];

    const rows = buildLedgerPreviewRows(transactions, 0, {
      generalLedger: true,
    });

    expect(rows).toHaveLength(7);
    expect(rows[1]).toMatchObject({
      kind: "entry",
      transactionId: "1",
      dateLabel: "3/5\n1",
      accountLabel: "未分類",
      description: "Lunch / with client",
      expense: 15,
      balance: -15,
    });
    expect(rows[3]).toMatchObject({
      kind: "closing",
      dateLabel: "12/31\n2",
      accountLabel: "事業主借",
      income: 15,
      balance: 0,
    });
    expect(rows[4]).toMatchObject({
      kind: "footer",
      description: "決算仕訳　合計",
      income: 15,
      expense: 0,
    });
    expect(rows[5]).toMatchObject({
      kind: "footer",
      description: "当期累計",
      income: 15,
      expense: 15,
    });
    expect(rows[6]).toMatchObject({
      kind: "footer",
      description: "翌期へ繰越",
      balance: 0,
    });
  });
});
