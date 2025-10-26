import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import { Account } from "@/types/firestore";

export async function createAccount({ name, currency, type, members = [], userId }: Account & { userId: string }){
  if (!name || !currency || !type) {
    throw new Error("Missing required fields: name, currency, or type.");
  }

  if (!["single", "shared"].includes(type)) {
    throw new Error('Invalid type. Must be "single" or "shared".');
  }

  if (type === "shared") {
    if (!Array.isArray(members) || members.length === 0 || members.length > 2) {
      throw new Error("Shared accounts must have 1–2 members.");
    }
  } else {
    members = [userId];
  }

  const docRef = await addDoc(collection(db, "accounts"), {
    name,
    currency,
    type,
    members,
    createdAt: new Date(),
  });

  return docRef.id;
}
