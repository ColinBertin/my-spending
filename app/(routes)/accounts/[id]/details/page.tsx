import { createClient } from "@/utils/supabase/server";
import AccountDetails from "./details";
import { redirect } from "next/navigation";
import {
  getMockAccountById,
  listMockTransactionsForAccount,
  MOCK_USER_ID,
} from "@/utils/mock/data";
import { isMockEnabled } from "@/utils/mock/env";

export const metadata = {
  title: "Transaction Details",
};

export default async function AccountDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
  const start = new Date(Date.UTC(currentYear, currentMonthIndex, 1, 0, 0, 0));
  const end = new Date(
    Date.UTC(currentYear, currentMonthIndex + 1, 1, 0, 0, 0),
  );

  if (isMockEnabled()) {
    const account = getMockAccountById(id);
    if (!account) redirect("/");

    const transactions = listMockTransactionsForAccount({
      accountId: id,
      userId: MOCK_USER_ID,
      selectedMonth: (currentMonthIndex + 1).toString(),
      selectedYear: currentYear.toString(),
    });

    return (
      <AccountDetails
        accountId={id}
        transactions={transactions}
        initialMonth={(currentMonthIndex + 1).toString()}
        initialYear={currentYear.toString()}
        accountName={account?.name ?? "Account"}
      />
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("name")
    .eq("id", id)
    .single();

  if (accountError) throw accountError;

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select(
      "id,title,type,category_name,category_icon,category_icon_pack,category_color,amount,currency,date,note,created_at",
    )
    .eq("account_id", id)
    .eq("created_by", user.id)
    .gte("date", start.toISOString())
    .lt("date", end.toISOString())
    .order("date", { ascending: true });

  if (error) throw error;

  return (
    <AccountDetails
      accountId={id}
      transactions={transactions ?? []}
      initialMonth={(currentMonthIndex + 1).toString()}
      initialYear={currentYear.toString()}
      accountName={account?.name ?? "Account"}
    />
  );
}
