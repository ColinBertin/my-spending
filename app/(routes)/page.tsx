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

type TransactionSummaryRow = {
  account_id: string | null;
  type: "income" | "expense" | null;
  category_name: string | null;
  amount: number;
  category_icon: string | null;
  category_icon_pack: string | null;
  category_color: string | null;
};

type MonthlyFlowTransactionRow = {
  date: string;
  type: "income" | "expense" | null;
  amount: number;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
  const currentMonthStart = new Date(
    Date.UTC(currentYear, currentMonthIndex, 1, 0, 0, 0),
  );
  const currentMonthEnd = new Date(
    Date.UTC(currentYear, currentMonthIndex + 1, 1, 0, 0, 0),
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

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

  let summaryRows: TransactionSummaryRow[] = [];

  if (accountIds.length > 0) {
    const { data: transactionData, error: transactionError } = await supabase
      .from("transactions")
      .select(
        "account_id,type,category_name,amount,category_icon,category_icon_pack,category_color",
      )
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", currentMonthStart.toISOString())
      .lt("date", currentMonthEnd.toISOString());

    if (transactionError) {
      throw transactionError;
    }

    summaryRows = (transactionData as TransactionSummaryRow[]) ?? [];
  }

  const monthlySummary = summaryRows.reduce(
    (acc, row) => {
      const amount = Number(row.amount) || 0;

      if (row.type === "income") {
        acc.totalIncome += amount;
      } else if (row.type === "expense") {
        acc.totalSpending += amount;
      }

      acc.transactionCount += 1;
      acc.net = acc.totalIncome - acc.totalSpending;

      return acc;
    },
    { totalIncome: 0, totalSpending: 0, transactionCount: 0, net: 0 },
  );

  const twelveMonthsAgoStart = new Date(
    Date.UTC(currentYear, currentMonthIndex - 11, 1, 0, 0, 0),
  );

  let monthlyFlowRows: MonthlyFlowTransactionRow[] = [];

  if (accountIds.length > 0) {
    const { data: monthlyFlowData, error: monthlyFlowError } = await supabase
      .from("transactions")
      .select("date,type,amount")
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", twelveMonthsAgoStart.toISOString())
      .lt("date", currentMonthEnd.toISOString());

    if (monthlyFlowError) {
      throw monthlyFlowError;
    }

    monthlyFlowRows = (monthlyFlowData as MonthlyFlowTransactionRow[]) ?? [];
  }

  const twelveMonthFlow = Array.from({ length: 12 }, (_, i) => {
    const monthDate = new Date(
      Date.UTC(currentYear, currentMonthIndex - 11 + i, 1),
    );
    const monthEnd = new Date(
      Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1),
    );

    const totals = monthlyFlowRows.reduce(
      (acc, row) => {
        const rowDate = new Date(row.date);

        if (rowDate < monthDate || rowDate >= monthEnd) {
          return acc;
        }

        const amount = Number(row.amount) || 0;

        if (row.type === "income") {
          acc.totalIncome += amount;
        } else if (row.type === "expense") {
          acc.totalSpending += amount;
        }

        return acc;
      },
      { totalIncome: 0, totalSpending: 0 },
    );

    return {
      label: monthDate.toLocaleString("default", { month: "short" }),
      year: monthDate.getUTCFullYear(),
      month: monthDate.getUTCMonth() + 1,
      ...totals,
    };
  });

  return (
    <Dashboard
      monthlyTransactionSummary={monthlySummary}
      twelveMonthFlow={twelveMonthFlow}
    />
  );
}
