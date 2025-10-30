import { db } from "@/firebaseConfig";
import { getMonthRange } from "@/helpers";
import { Transaction } from "@/types/firestore";
import {
  collection,
  getDocs,
  query,
  Timestamp,
  where,
} from "firebase/firestore";

export async function getMonthlyRangeTransactions(
  accountId: string,
  selectedMonth: string,
  selectedYear: string,
): Promise<Transaction[]> {
  const { startOfMonth, endOfMonth } = getMonthRange(
    parseInt(selectedMonth),
    parseInt(selectedYear),
  );

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
