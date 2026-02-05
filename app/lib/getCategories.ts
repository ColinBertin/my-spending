import { convertCategory } from "./convertCategory";
import { createClient } from "@/utils/supabase/client";
import { getAuthUser } from "@/utils/authClient";
import { getMockCategoriesForUser, isMockEnabled } from "@/utils/mockData";

export async function getCategories() {
  const user = await getAuthUser();

  if (!user) throw new Error("User not signed in");

  if (isMockEnabled()) {
    return getMockCategoriesForUser(user.id).map((category) =>
      convertCategory(category),
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("userId", user.id);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => convertCategory(row));
}
