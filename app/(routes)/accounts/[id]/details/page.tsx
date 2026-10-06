import { requirePageUser } from "@/utils/supabase/requireUser";
import AccountDetails from "./details";

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

  const { user, supabase } = await requirePageUser();

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("name")
    .eq("id", id)
    .single();

  if (accountError) {
    throw accountError;
  }

  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("account_id", id)
    .eq("created_by", user.id)
    .gte("date", start.toISOString())
    .lt("date", end.toISOString())
    .order("date", { ascending: true });

  if (error) {
    throw error;
  }

  return (
    <AccountDetails
      accountId={id}
      transactions={transactions}
      initialMonth={(currentMonthIndex + 1).toString()}
      initialYear={currentYear.toString()}
      accountName={account?.name}
    />
  );
}
