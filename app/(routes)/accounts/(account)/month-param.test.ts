import { describe, expect, it } from "vitest";
import { parseMonthParam, toMonthParam } from "./month-param";

describe("parseMonthParam", () => {
  it("parses a YYYY-MM value", () => {
    expect(parseMonthParam("2026-03")).toEqual({ year: 2026, month: 3 });
  });

  it.each([
    null,
    undefined,
    "",
    "2026-3",
    "2026-13",
    "2026-00",
    "1969-12",
    "x",
  ])("rejects %s", (value) => {
    expect(parseMonthParam(value)).toBeNull();
  });
});

describe("toMonthParam", () => {
  it("zero-pads the month and round-trips", () => {
    expect(toMonthParam({ year: 2026, month: 3 })).toBe("2026-03");
    expect(parseMonthParam(toMonthParam({ year: 2025, month: 11 }))).toEqual({
      year: 2025,
      month: 11,
    });
  });
});
