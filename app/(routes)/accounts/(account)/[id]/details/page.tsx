import { notFound } from "next/navigation";
import { requirePageUser } from "@/utils/supabase/requireUser";
import { parseMonthParam } from "../../month-param";
import AccountDetails from "./details";

export const metadata = {
  title: "Transaction Details",
};

export default async function AccountDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string | string[] }>;
}) {
  const { id } = await params;
  const { month } = await searchParams;
  const now = new Date();
  const { year, month: monthNumber } = parseMonthParam(
    typeof month === "string" ? month : null,
  ) ?? { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1 };
  const start = new Date(Date.UTC(year, monthNumber - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, monthNumber, 1, 0, 0, 0));

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

  // 404 rather than 403 so account ids can't be probed.
  if (!membership) {
    notFound();
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
      transactions={transactions ?? []}
      initialMonth={monthNumber.toString()}
      initialYear={year.toString()}
    />
  );
}
