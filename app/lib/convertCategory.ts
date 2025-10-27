import { Timestamp } from "firebase/firestore";
import type { Category } from "@/types/firestore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertCategory(data: any, id: string): Category {
  return {
    id,
    ...data,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate()
        : data.createdAt,
  };
}
