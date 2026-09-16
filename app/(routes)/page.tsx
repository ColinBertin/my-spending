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

type TransactionFlowRow = {
  type: "income" | "expense" | null;
  amount: number;
  date: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
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

  let currentMonthTransactionCount = 0;

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

    if (monthsAgo === 0) {
      currentMonthTransactionCount += 1;
    }
  }

  const currentMonth = twelveMonthFlow[11];
  const monthlySummary = {
    totalIncome: currentMonth.totalIncome,
    totalSpending: currentMonth.totalSpending,
    net: currentMonth.totalIncome - currentMonth.totalSpending,
    transactionCount: currentMonthTransactionCount,
  };

  return (
    <Dashboard
      monthlyTransactionSummary={monthlySummary}
      twelveMonthFlow={twelveMonthFlow}
    />
  );
}
