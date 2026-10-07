import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emailRegex,
  formatCurrencyIntoYen,
  getCurrentMonthRange,
  getLedgerEndingBalance,
  getMonthRange,
  getTimeOfDayGreeting,
  splitLedgerDateLabel,
  sumIncomeAndSpending,
} from "./index";

describe("helpers", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("validates common email formats", () => {
    expect(emailRegex.test("jane.doe+work@example.com")).toBe(true);
    expect(emailRegex.test("invalid-email")).toBe(false);
  });

  it("formats numbers into JPY currency", () => {
    const formatted = formatCurrencyIntoYen(1234);

    expect(formatted).toContain("1,234");
    expect(formatted).toMatch(/[¥￥]/);
  });

  it("returns expected month range for a given month and year", () => {
    const { startOfMonth, endOfMonth } = getMonthRange(2, 2025);

    expect(startOfMonth.getFullYear()).toBe(2025);
    expect(startOfMonth.getMonth()).toBe(1);
    expect(startOfMonth.getDate()).toBe(1);
    expect(startOfMonth.getHours()).toBe(0);

    expect(endOfMonth.getFullYear()).toBe(2025);
    expect(endOfMonth.getMonth()).toBe(1);
    expect(endOfMonth.getDate()).toBe(28);
    expect(endOfMonth.getHours()).toBe(23);
    expect(endOfMonth.getMinutes()).toBe(59);
  });

  it("throws for invalid month numbers", () => {
    expect(() => getMonthRange(0, 2025)).toThrow(
      "Invalid month number. Must be between 1 and 12.",
    );
    expect(() => getMonthRange(13, 2025)).toThrow(
      "Invalid month number. Must be between 1 and 12.",
    );
  });

  it("returns the current month boundaries", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0));

    const { startOfMonth, endOfMonth } = getCurrentMonthRange();

    expect(startOfMonth.getFullYear()).toBe(2026);
    expect(startOfMonth.getMonth()).toBe(6);
    expect(startOfMonth.getDate()).toBe(1);

    expect(endOfMonth.getFullYear()).toBe(2026);
    expect(endOfMonth.getMonth()).toBe(6);
    expect(endOfMonth.getDate()).toBe(31);
    expect(endOfMonth.getHours()).toBe(23);
    expect(endOfMonth.getMinutes()).toBe(59);
  });

  it("returns greeting based on current time", () => {
    vi.useFakeTimers();

    vi.setSystemTime(new Date(2026, 0, 1, 8, 0, 0));
    expect(getTimeOfDayGreeting()).toBe("Good morning, ");

    vi.setSystemTime(new Date(2026, 0, 1, 14, 0, 0));
    expect(getTimeOfDayGreeting()).toBe("Good afternoon, ");

    vi.setSystemTime(new Date(2026, 0, 1, 20, 0, 0));
    expect(getTimeOfDayGreeting()).toBe("Good evening, ");
  });
  it("sums income and spending, treating non-income as spending", () => {
    expect(
      sumIncomeAndSpending([
        { type: "income", amount: 1000 },
        { type: "expense", amount: 250 },
        { type: "expense", amount: Number("not-a-number") },
        { type: "income", amount: 500 },
      ]),
    ).toEqual({ totalIncome: 1500, totalSpending: 250 });
    expect(sumIncomeAndSpending([])).toEqual({
      totalIncome: 0,
      totalSpending: 0,
    });
  });

  it("splits ledger date labels into date and voucher number", () => {
    expect(splitLedgerDateLabel("1/5\n12")).toEqual({
      date: "1/5",
      voucherNo: "12",
    });
    expect(splitLedgerDateLabel("\n3")).toEqual({ date: "", voucherNo: "3" });
    expect(splitLedgerDateLabel(undefined)).toEqual({
      date: "",
      voucherNo: "",
    });
  });

  it("returns the running balance after the last ledger entry", () => {
    expect(
      getLedgerEndingBalance([
        { id: "carry", kind: "carry", balance: 100 },
        { id: "e1", kind: "entry", balance: 600 },
        { id: "e2", kind: "entry", balance: 450 },
        { id: "s", kind: "subtotal", income: 500, expense: 150 },
        { id: "closing", kind: "closing", balance: 100 },
        { id: "f", kind: "footer", balance: 100 },
      ]),
    ).toBe(450);
  });

  it("falls back to the opening balance when there are no entries", () => {
    expect(
      getLedgerEndingBalance([
        { id: "carry", kind: "carry", balance: 80 },
        { id: "f", kind: "footer", balance: 80 },
      ]),
    ).toBe(80);
    expect(getLedgerEndingBalance([])).toBe(0);
  });
});
