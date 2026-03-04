import { afterEach, describe, expect, it, vi } from "vitest";
import type { CellObject } from "xlsx";
import type { Transaction } from "../types";

function getCellValue(ws: Record<string, CellObject>, addr: string) {
  return ws[addr]?.v;
}

async function loadBuilder() {
  vi.resetModules();
  return import("./ledgerXlsx");
}

describe("buildLedgerWorkbook", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("generates a ledger workbook with correct running balances, month subtotals and total", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);

    const { buildLedgerWorkbook } = await loadBuilder();

    const transactions: Transaction[] = [
      {
        id: "3",
        title: "Groceries",
        type: "expense",
        category_name: "Food",
        amount: 30,
        currency: "JPY",
        date: new Date("2025-02-01T00:00:00.000Z"),
        note: "market",
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
      {
        id: "2",
        title: "Transport",
        type: "expense",
        category_name: "Travel",
        amount: 40,
        currency: "JPY",
        date: new Date("2025-01-01T12:00:00.000Z"),
        note: "taxi",
      },
      {
        id: "4",
        title: "Refund",
        type: "income",
        category_name: "Income",
        amount: 20,
        currency: "JPY",
        date: new Date("2025-02-15T00:00:00.000Z"),
      },
    ];

    const wb = await buildLedgerWorkbook(transactions, 50);
    const ws = wb.Sheets[wb.SheetNames[0]] as Record<string, CellObject> & {
      "!ref"?: string;
    };

    // Fallback template keeps a minimum print range that extends to row 48.
    expect(ws["!ref"]).toBe("A1:F48");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    expect(getCellValue(ws, "C2")).toBe("前期より繰越");
    expect(getCellValue(ws, "F2")).toBe(50);

    // Jan 1 income voucher #1
    expect(getCellValue(ws, "A3")).toBe("1/1\n1");
    expect(getCellValue(ws, "B3")).toBe("現金");
    expect(getCellValue(ws, "C3")).toBe("Salary");
    expect(getCellValue(ws, "D3")).toBe(100);
    expect(getCellValue(ws, "F3")).toBe(150);

    // Same day voucher #2 should hide date prefix and keep voucher number
    expect(getCellValue(ws, "A4")).toBe("\n2");
    expect(getCellValue(ws, "C4")).toBe("Transport / taxi");
    expect(getCellValue(ws, "E4")).toBe(40);
    expect(getCellValue(ws, "F4")).toBe(110);

    // January subtotal
    expect(getCellValue(ws, "C5")).toBe("１月度　合計");
    expect(getCellValue(ws, "D5")).toBe(100);
    expect(getCellValue(ws, "E5")).toBe(40);

    // February entries
    expect(getCellValue(ws, "A6")).toBe("2/1\n3");
    expect(getCellValue(ws, "E6")).toBe(30);
    expect(getCellValue(ws, "F6")).toBe(80);
    expect(getCellValue(ws, "A7")).toBe("2/15\n4");
    expect(getCellValue(ws, "D7")).toBe(20);
    expect(getCellValue(ws, "F7")).toBe(100);

    // February subtotal and final total
    expect(getCellValue(ws, "C8")).toBe("２月度　合計");
    expect(getCellValue(ws, "D8")).toBe(20);
    expect(getCellValue(ws, "E8")).toBe(30);
    expect(getCellValue(ws, "C9")).toBe("当期累計");
    expect(getCellValue(ws, "D9")).toBe(120);
    expect(getCellValue(ws, "E9")).toBe(70);
    expect(getCellValue(ws, "F9")).toBe(100);
  });

  it("uses category label in general ledger mode and falls back to 未分類", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    const { buildLedgerWorkbook } = await loadBuilder();

    const transactions: Transaction[] = [
      {
        id: "1",
        title: "Lunch",
        type: "expense",
        category_name: "",
        amount: 15,
        currency: "JPY",
        date: new Date("2025-03-05T00:00:00.000Z"),
        note: "  with client  ",
      },
    ];

    const wb = await buildLedgerWorkbook(transactions, 0, {
      generalLedger: true,
    });
    const ws = wb.Sheets[wb.SheetNames[0]] as Record<string, CellObject> & {
      "!rows"?: Array<{ hpx?: number }>;
    };

    // Entry row is row 3 (1-indexed): carry row first, then entry row.
    expect(getCellValue(ws, "A3")).toBe("3/5\n1");
    expect(getCellValue(ws, "B3")).toBe("未分類");
    expect(getCellValue(ws, "C3")).toBe("Lunch / with client");
    expect(getCellValue(ws, "E3")).toBe(15);
    expect(getCellValue(ws, "F3")).toBe(-15);

    expect(getCellValue(ws, "A5")).toBe("12/31\n2");
    expect(getCellValue(ws, "B5")).toBe("事業主借");
    expect(getCellValue(ws, "D5")).toBe(15);
    expect(getCellValue(ws, "F5")).toBe(0);
    expect(getCellValue(ws, "C6")).toBe("決算仕訳　合計");
    expect(getCellValue(ws, "D6")).toBe(15);
    expect(getCellValue(ws, "E6")).toBe(0);
    expect(getCellValue(ws, "F6")).toBeUndefined();
    expect(getCellValue(ws, "C7")).toBe("当期累計");
    expect(getCellValue(ws, "D7")).toBe(15);
    expect(getCellValue(ws, "E7")).toBe(15);
    expect(getCellValue(ws, "F7")).toBeUndefined();
    expect(getCellValue(ws, "C8")).toBe("翌期へ繰越");
    expect(getCellValue(ws, "F8")).toBe(0);

    const rows = ws["!rows"] ?? [];
    expect(rows[5]?.hpx).toBe(16);
    expect(rows[6]?.hpx).toBe(16);
    expect(rows[7]?.hpx).toBe(16);
  });
});
