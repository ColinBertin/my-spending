/** Date → "YYYY-MM-DD" in the user's local timezone (the format <input type="date"> uses). */
export function toLocalInputDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/**
 * "YYYY-MM-DD" → Date at local noon. Noon keeps the calendar day stable when
 * the Date is later serialised to UTC (midnight could roll back a day).
 */
export function fromLocalInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}
