import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Category } from "@/types/firestore";

export async function createCategory({
  name,
  color,
  userId,
  icon,
  iconPack,
}: Category & { userId: string }) {
  if (!name || !color || !icon || !iconPack) {
    throw new Error("Missing required fields: name, color, icon, or iconPack.");
  }

  const docRef = await addDoc(collection(db, "categories"), {
    name,
    color,
    icon,
    iconPack,
    userId,
    createdAt: new Date(),
  });

  return docRef.id;
}
