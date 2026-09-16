import { Account, RecentActivityItem } from "@/types";
import Dashboard from "./dashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getAccountsSummary, getMonthlySummary } from "./actions";

export const metadata = {
  title: "Dashboard",
};

type AccountMemberRow = {
  account: Account;
};

type TransactionFlowRow = {
  type: "income" | "expense" | null;
  amount: number;
  date: string;
};

type RecentTransactionRow = {
  id: string;
  title: string;
  amount: number;
  date: string;
  type: "income" | "expense" | null;
  category_name: string | null;
  account: { name: string } | null;
};

export default async function DashboardPage() {
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
  const twelveMonthsAgoStart = new Date(
    Date.UTC(currentYear, currentMonthIndex - 11, 1),
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

  // Fetch the past 12 months transactions
  let flowRows: TransactionFlowRow[] = [];

  if (accountIds.length > 0) {
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .select("type,amount,date")
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", twelveMonthsAgoStart.toISOString())
      .lt("date", currentMonthEnd.toISOString());

    if (transactionError) {
      throw transactionError;
    }

    flowRows = (transactionData as TransactionFlowRow[]) ?? [];
  }

  // Bucket the fetched rows into 12 calendar months
  const twelveMonthFlow = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(Date.UTC(currentYear, currentMonthIndex - 11 + i, 1));
    return {
      label: date.toLocaleString("default", { month: "short" }),
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      totalIncome: 0,
      totalSpending: 0,
    };
  });

  for (const row of flowRows) {
    const rowDate = new Date(row.date);
    const monthsAgo =
      (currentYear - rowDate.getUTCFullYear()) * 12 +
      (currentMonthIndex - rowDate.getUTCMonth());
    const bucket = twelveMonthFlow[11 - monthsAgo];

    if (!bucket) {
      continue;
    }

    const amount = Number(row.amount) || 0;

    if (row.type === "income") {
      bucket.totalIncome += amount;
    } else if (row.type === "expense") {
      bucket.totalSpending += amount;
    }
  }

  // The 5 most recent transactions this month, across all accounts. Fetched
  // once here only — it does not refetch when the month picker changes.
  let recentActivity: RecentActivityItem[] = [];

  if (accountIds.length > 0) {
    const { data: recentData, error: recentError } = await supabase
      .from("transactions")
      .select("id,title,amount,date,type,category_name,account:accounts(name)")
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", currentMonthStart.toISOString())
      .lt("date", currentMonthEnd.toISOString())
      .order("date", { ascending: false })
      .limit(5);

    if (recentError) {
      throw recentError;
    }

    recentActivity = (
      (recentData as unknown as RecentTransactionRow[]) ?? []
    ).map((row) => ({
      id: row.id,
      date: new Date(row.date).toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      }),
      category: row.category_name ?? "—",
      title: row.title,
      accountName: row.account?.name ?? "—",
      amount: Number(row.amount) || 0,
      type: row.type ?? "expense",
    }));
  }

  // This month's stats and per-account breakdown, via the same actions the
  // month picker calls on change
  const [monthlySummary, accountsSummary] = await Promise.all([
    getMonthlySummary(currentMonthIndex + 1, currentYear),
    getAccountsSummary(currentMonthIndex + 1, currentYear),
  ]);

  return (
    <Dashboard
      monthlyTransactionSummary={monthlySummary}
      twelveMonthFlow={twelveMonthFlow}
      accountsSummary={accountsSummary}
      recentActivity={recentActivity}
    />
  );
}
