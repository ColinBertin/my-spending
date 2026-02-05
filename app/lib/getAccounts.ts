import { convertAccount } from "./convertAccount";
import { createClient } from "@/utils/supabase/client";
import { getAuthUser } from "@/utils/authClient";
import { getMockAccountsForUser, isMockEnabled } from "@/utils/mockData";

export async function getAccounts() {
  const user = await getAuthUser();

  if (!user) throw new Error("User not signed in");

  if (isMockEnabled()) {
    return getMockAccountsForUser(user.id).map((account) =>
      convertAccount(account),
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .contains("members", [user.id]);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => convertAccount(row));
}
