import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Category } from "@/types/firestore";

export async function createCategory({
  name,
  color,
  userId,
  icon,
}: Category & { userId: string }) {
  if (!name || !color || !icon) {
    throw new Error("Missing required fields: name, currency, or type.");
  }

  const docRef = await addDoc(collection(db, "categories"), {
    name,
    color,
    icon,
    userId,
    createdAt: new Date(),
  });

  return docRef.id;
}
