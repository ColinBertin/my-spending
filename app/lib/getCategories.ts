import { collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "./firebase";
import { convertCategory } from "./convertCategory";

export async function getCategories() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) throw new Error("User not signed in");

  const q = query(
    collection(db, "categories"),
    where("userId", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  const categories = snapshot.docs.map(doc => convertCategory(doc.data(), doc.id));
  return categories;
}
