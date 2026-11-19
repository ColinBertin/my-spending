import { Category } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import CreateUpdateCategory from "../../create-update-category";

export const metadata = {
  title: "Update Category",
};

export const getCategory = cache(async (id: string): Promise<Category> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,icon_pack,type")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    throw error;
  }

  return data;
});

export default async function UpdateCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategory(id);

  return <CreateUpdateCategory category={category} />;
}
