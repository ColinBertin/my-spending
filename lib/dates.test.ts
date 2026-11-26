import { describe, expect, it } from "vitest";
import { fromLocalInputDate, toLocalInputDate } from "./dates";

describe("toLocalInputDate", () => {
  it("formats a Date as YYYY-MM-DD in local time, zero-padded", () => {
    expect(toLocalInputDate(new Date(2026, 0, 5, 9, 30))).toBe("2026-01-05");
  });

  it("accepts an ISO string", () => {
    const iso = new Date(2026, 10, 26, 12).toISOString();
    expect(toLocalInputDate(iso)).toBe("2026-11-26");
  });

  it("keeps the local day late in the evening", () => {
    expect(toLocalInputDate(new Date(2026, 1, 28, 23, 59))).toBe("2026-02-28");
  });
});

describe("fromLocalInputDate", () => {
  it("parses YYYY-MM-DD to local noon on that day", () => {
    const date = fromLocalInputDate("2026-02-20");

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(1);
    expect(date.getDate()).toBe(20);
    expect(date.getHours()).toBe(12);
  });

  it("round-trips with toLocalInputDate", () => {
    for (const value of [
      "2026-01-01",
      "2026-02-28",
      "2024-02-29",
      "2026-12-31",
    ]) {
      expect(toLocalInputDate(fromLocalInputDate(value))).toBe(value);
    }
  });
});
