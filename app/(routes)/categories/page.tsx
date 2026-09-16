import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import CategoriesList from "./categories-list";

export const metadata = {
  title: "Categories",
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return <CategoriesList categories={categories ?? []} />;
}
