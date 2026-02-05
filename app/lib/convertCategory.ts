import type { Category } from "@/types/firestore";

function normalizeDate(value: unknown) {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(value as string);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertCategory(data: any, id?: string): Category {
  return {
    id: id ?? data.id,
    ...data,
    createdAt: normalizeDate(data.createdAt) ?? new Date(),
  };
}
