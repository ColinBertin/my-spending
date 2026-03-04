import {
  Account,
  CategoryTotal,
  DashboardAccountSummary,
  TransactionType,
} from "../../types";
import Dashboard from "./dashboard";
import { createClient } from "../../utils/supabase/server";
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

export default async function DashboardPage() {
  const supabase = await createClient();
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonthIndex = now.getUTCMonth();
  const currentMonth = (currentMonthIndex + 1).toString();
  const currentYearString = currentYear.toString();
  const start = new Date(Date.UTC(currentYear, currentMonthIndex, 1, 0, 0, 0));
  const end = new Date(
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
      .gte("date", start.toISOString())
      .lt("date", end.toISOString());

    if (transactionError) throw transactionError;

    summaryRows = (transactionData as TransactionSummaryRow[]) ?? [];
  }

  const summariesByAccount = new Map<
    string,
    {
      categoryTotals: Map<string, CategoryTotal>;
      totalIncome: number;
      totalSpending: number;
    }
  >();

  for (const row of summaryRows) {
    if (!row.account_id) continue;

    if (!summariesByAccount.has(row.account_id)) {
      summariesByAccount.set(row.account_id, {
        categoryTotals: new Map<string, CategoryTotal>(),
        totalIncome: 0,
        totalSpending: 0,
      });
    }

    const accountSummary = summariesByAccount.get(row.account_id);
    if (!accountSummary) continue;

    const amount = Number(row.amount) || 0;

    if (!row.type) continue;

    if (row.type === "income") {
      accountSummary.totalIncome += amount;
    } else {
      accountSummary.totalSpending += amount;
    }
    if (!row.category_name) continue;

    const categoryKey = `${row.type as TransactionType}:${row.category_name}`;
    const existingCategory = accountSummary.categoryTotals.get(categoryKey);

    if (existingCategory) {
      existingCategory.total += amount;

      if (!existingCategory.category_icon && row.category_icon) {
        existingCategory.category_icon = row.category_icon;
      }
      if (!existingCategory.category_icon_pack && row.category_icon_pack) {
        existingCategory.category_icon_pack = row.category_icon_pack;
      }
      if (!existingCategory.category_color && row.category_color) {
        existingCategory.category_color = row.category_color;
      }

      continue;
    }

    accountSummary.categoryTotals.set(categoryKey, {
      category: row.category_name,
      type: row.type as TransactionType,
      total: amount,
      category_icon: row.category_icon ?? undefined,
      category_icon_pack: row.category_icon_pack ?? undefined,
      category_color: row.category_color ?? undefined,
    });
  }

  const accountSummaries: DashboardAccountSummary[] = accounts.map(
    (account) => {
      const accountId = account.id;
      const accountSummary = accountId
        ? summariesByAccount.get(accountId)
        : undefined;

      const categoryTotals = accountSummary
        ? Array.from(accountSummary.categoryTotals.values()).sort((a, b) => {
            if (a.type !== b.type) {
              return a.type === "income" ? -1 : 1;
            }

            return a.category.localeCompare(b.category);
          })
        : [];

      return {
        account,
        summary: {
          categoryTotals,
          totalSpending: accountSummary?.totalSpending ?? 0,
          totalIncome: accountSummary?.totalIncome ?? 0,
          selectedMonth: currentMonth,
          selectedYear: currentYearString,
        },
      };
    },
  );

  return <Dashboard accountSummaries={accountSummaries} />;
}
