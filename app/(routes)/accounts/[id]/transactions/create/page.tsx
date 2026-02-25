import CreateTransaction from "./create-transaction";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { listMockCategoriesForUser, MOCK_USER_ID } from "@/utils/mock/data";
import { isMockEnabled } from "@/utils/mock/env";

export const metadata = {
  title: "Add Transaction",
};

export default async function CreateTransactions({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  if (isMockEnabled()) {
    const categories = listMockCategoriesForUser(MOCK_USER_ID);
    return <CreateTransaction accountId={id} categories={categories} />;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: categories, error } = await supabase
    .from("categories")
    .select("id,name,color,icon,icon_pack,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return <CreateTransaction accountId={id} categories={categories ?? []} />;
}
