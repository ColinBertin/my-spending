import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { getCurrentMonthRange } from "@/helpers";
import { Transaction } from "@/types/firestore";

export async function getThisMonthTransactions(
  accountId: string,
): Promise<Transaction[]> {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();

  const transactionsRef = collection(db, "transactions");
  const q = query(
    transactionsRef,
    where("accountId", "==", accountId),
    where("date", ">=", Timestamp.fromDate(startOfMonth)),
    where("date", "<=", Timestamp.fromDate(endOfMonth)),
  );

  const snapshot = await getDocs(q);

  const data: Transaction[] = snapshot.docs.map((doc) => {
    const transactionData = doc.data() as Omit<Transaction, "id">;

    return {
      id: doc.id,
      ...transactionData,
      date:
        transactionData.date instanceof Timestamp
          ? transactionData.date.toDate()
          : transactionData.date,
    };
  });

  return data;
}
