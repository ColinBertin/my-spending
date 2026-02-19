import { Account } from "@/types";
import Dashboard from "./dashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Dashboard",
};

type AccountMemberRow = {
  account: Account;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("account_members")
    .select(
      "account:accounts!inner(id,name,type,currency,created_at,updated_at)",
    )
    .eq("user_id", user.id);

  if (error) throw error;

  const accounts = (data as unknown as AccountMemberRow[]).map(
    (r) => r.account,
  );

  const singleAccounts = accounts.filter((a) => a.type === "single");
  const sharedAccounts = accounts.filter((a) => a.type === "shared");

  return (
    <Dashboard
      singleAccounts={singleAccounts}
      sharedAccounts={sharedAccounts}
    />
  );
}
