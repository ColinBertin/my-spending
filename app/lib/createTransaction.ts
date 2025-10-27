import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Transaction } from "@/types/firestore";

export async function createTransaction({
  title,
  type,
  currency,
  amount,
  note,
  date,
  userId,
  accountId,
  categoryId,
  categoryName,
}: Transaction & { userId: string }) {
  if (
    !title ||
    !type ||
    !currency ||
    !amount ||
    !date ||
    !accountId ||
    !userId ||
    !categoryId ||
    !categoryName
  ) {
    throw new Error("Missing required fields: title, currency, or type.");
  }

  if (!["expense", "income"].includes(type)) {
    throw new Error('Invalid type. Must be "expense" or "income".');
  }

  const docRef = await addDoc(collection(db, "transactions"), {
    categoryId,
    categoryName,
    title,
    type,
    currency,
    amount: parseInt(amount as unknown as string, 10),
    note,
    date,
    accountId,
    createdBy: userId,
    createdAt: new Date(),
  });

  return docRef.id;
}
