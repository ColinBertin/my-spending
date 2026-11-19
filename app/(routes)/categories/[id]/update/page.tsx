import { Category } from "@/types";
import { notFound } from "next/navigation";
import { cache } from "react";
import CreateUpdateCategory from "../../create-update-category";
import { requirePageUser } from "@/utils/supabase/requireUser";

export const metadata = {
  title: "Update Category",
};

export const getCategory = cache(async (id: string): Promise<Category> => {
  const { user, supabase } = await requirePageUser();

  const { data, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,icon_pack,type")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    notFound();
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

  return <CreateUpdateCategory mode="update" category={category} />;
}
