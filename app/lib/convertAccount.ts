import { Timestamp } from "firebase/firestore";
import type { Account } from "@/types/firestore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertAccount(data: any, id: string): Account {
  return {
    id,
    ...data,
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
