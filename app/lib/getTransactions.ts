import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import { convertTransaction } from "./convertTransaction";

export async function getTransactions(accountId: string) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not signed in");

  const q = query(
    collection(db, "transactions"),
    where("accountId", "==", accountId)
  );

  const snapshot = await getDocs(q);

  const transactions = snapshot.docs.map(doc => convertTransaction(doc.data(), doc.id));
  return transactions;
}
