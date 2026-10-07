export type MonthParam = { year: number; month: number };

export const MONTH_PARAM = "month";

export function parseMonthParam(
  value: string | null | undefined,
): MonthParam | null {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);

  if (year < 1970 || month < 1 || month > 12) {
    return null;
  }

  return { year, month };
}

export function toMonthParam({ year, month }: MonthParam) {
  return `${year}-${String(month).padStart(2, "0")}`;
}
