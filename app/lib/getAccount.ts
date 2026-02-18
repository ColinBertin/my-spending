import { convertAccount } from "./convertAccount";
import { createClient } from "@/utils/supabase/client";
import { getAuthUser } from "@/utils/authClient";
import { getMockAccountById, isMockEnabled } from "@/utils/mockData";

export async function getAccountById(id: string) {
  const user = await getAuthUser();

  if (!user) throw new Error("User not signed in");

  if (isMockEnabled()) {
    const mockAccount = getMockAccountById(id);
    if (!mockAccount) throw new Error("Account not found");
    if (!mockAccount.account_members?.some((m) => m.user_id === user.id)) {
      throw new Error("You do not have permission to view this account");
    }
    return convertAccount(mockAccount);
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) throw new Error(error?.message ?? "Account not found");

  const account = convertAccount(data);

  if (!account.account_members?.some((m) => m.user_id === user.id)) {
    throw new Error("You do not have permission to view this account");
  }

  return account;
}
