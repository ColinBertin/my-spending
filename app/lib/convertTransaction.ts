import type { Transaction } from "@/types/firestore";

function normalizeDate(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertTransaction(data: any, id?: string): Transaction {
  return {
    id: id ?? data.id,
    ...data,
    date: normalizeDate(data.date) ?? new Date(),
    createdAt: normalizeDate(data.createdAt) ?? new Date(),
    updatedAt: normalizeDate(data.updatedAt),
  };
}
