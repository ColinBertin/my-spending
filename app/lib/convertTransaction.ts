import { Timestamp } from "firebase/firestore";
import type { Transaction } from "@/types/firestore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertTransaction(data: any, id: string): Transaction {
  return {
    id,
    ...data,
    date:
      data.date instanceof Timestamp
        ? data.date.toDate()
        : data.date,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate()
        : data.updatedAt,
  };
}
