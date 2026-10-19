import { notFound } from "next/navigation";
import CreateTransaction from "./create-transaction";
import { requirePageUser } from "@/utils/supabase/requireUser";

export const metadata = {
  title: "Add Transaction",
};

export default async function CreateTransactions({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { user, supabase } = await requirePageUser();

  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("account_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw membershipError;
  }

  if (!membership) {
    notFound();
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("name,type,currency")
    .eq("id", id)
    .single();

  if (accountError) {
    throw accountError;
  }

  const accountType =
    account.type === "single" || account.type === "shared"
      ? "normal"
      : "professional";

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", user.id)
    .eq("type", accountType)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    <CreateTransaction
      accountId={id}
      accountName={account.name}
      accountCurrency={account.currency}
      categories={categories}
    />
  );
}
