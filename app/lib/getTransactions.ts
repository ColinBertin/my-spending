import { convertTransaction } from "./convertTransaction";
import { createClient } from "@/utils/supabase/client";
import { getAuthUser } from "@/utils/authClient";
import { getMockTransactionsForAccount, isMockEnabled } from "@/utils/mockData";

export async function getTransactions(accountId: string) {
  const user = await getAuthUser();

  if (!user) throw new Error("User not signed in");

  if (isMockEnabled()) {
    return getMockTransactionsForAccount(accountId).map((transaction) =>
      convertTransaction(transaction),
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("accountId", accountId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => convertTransaction(row));
}
