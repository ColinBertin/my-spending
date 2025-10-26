import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "@/types/firestore";

export async function createTransaction({ title, type, currency, amount, note, date, userId, accountId }: Transaction & { userId: string }){
  if (!title || !type || !currency || !amount || !date || !accountId || !userId) {
    throw new Error("Missing required fields: title, currency, or type.");
  }

  if (!["expense", "income"].includes(type)) {
    throw new Error('Invalid type. Must be "expense" or "income".');
  }

  const docRef = await addDoc(collection(db, "transactions"), {
    title,
    type,
    currency,
    amount,
    note,
    date,
    accountId,
    createdBy: userId,
    createdAt: new Date(),
  });

  return docRef.id;
}
