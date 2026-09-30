import { AccountMemberRow, TransactionFlowRow } from "@/types";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Accounts from "./accounts";

export const metadata = {
  title: "Accounts",
};

export default async function AccountsPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
  const currentMonthStart = new Date(
    Date.UTC(currentYear, currentMonthIndex, 1),
  );
  const currentMonthEnd = new Date(
    Date.UTC(currentYear, currentMonthIndex + 1, 1),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user accounts
  const { data, error } = await supabase
    .from("account_members")
    .select(
      "account:accounts!inner(id,name,type,currency,created_at,updated_at)",
    )
    .eq("user_id", user.id);

  if (error) {
    throw error;
  }

  const accounts = (data as unknown as AccountMemberRow[]).map(
    (r) => r.account,
  );

  const accountIds = accounts
    .map((account) => account.id)
    .filter((id): id is string => Boolean(id));

  // Fetch current month transactions
  let flowRows: TransactionFlowRow[] = [];

  if (accountIds.length > 0) {
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .select("type,amount,date,account_id")
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", currentMonthStart.toISOString())
      .lt("date", currentMonthEnd.toISOString());

    if (transactionError) {
      throw transactionError;
    }

    flowRows = (transactionData as TransactionFlowRow[]) ?? [];
  }

  return <Accounts accounts={accounts} transactions={flowRows} />;
}
