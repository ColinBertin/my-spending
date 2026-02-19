import { createClient } from "@/utils/supabase/server";
import AccountDetails from "./details";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Transaction Details",
};

export default async function AccountDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      "id,title,type,category_name,category_icon,category_icon_pack,category_color,amount,currency,date,note,created_at",
    )
    .eq("account_id", id)
    .eq("created_by", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return <AccountDetails accountId={id} transactions={transactions} />;
}
