import { afterEach, describe, expect, it, vi } from "vitest";
import {
  emailRegex,
  formatCurrencyIntoYen,
  getCurrentMonthRange,
  getMonthRange,
  getTimeOfDayGreeting,
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
});
