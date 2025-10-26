import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import { convertAccount } from "./convertAccount";

export async function getAccounts() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not signed in");

  const q = query(
    collection(db, "accounts"),
    where("members", "array-contains", user.uid)
  );

  const snapshot = await getDocs(q);

  const accounts = snapshot.docs.map(doc => convertAccount(doc.data(), doc.id));
  return accounts;
}
