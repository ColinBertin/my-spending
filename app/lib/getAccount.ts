import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import { convertAccount } from "./convertAccount";

export async function getAccountById(id: string) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not signed in");

  const ref = doc(db, "accounts", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error("Account not found");
  }

  const account = convertAccount(snapshot.data(), snapshot.id);

  if (!account.members.includes(user.uid)) {
    throw new Error("You do not have permission to view this account");
  }

  return account;
}
