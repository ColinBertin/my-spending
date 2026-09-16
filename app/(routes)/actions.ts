"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import {
  AccountMonthlySummary,
  CategoryTotal,
  MonthlyTransactionSummary,
} from "@/types";

type TransactionAmountRow = {
  type: "income" | "expense" | null;
  amount: number;
  category_name: string | null;
  category_icon: string | null;
  category_icon_pack: string | null;
  category_color: string | null;
};

type AccountRow = {
  id: string;
  name: string;
  type: "single" | "shared" | "professional";
  currency: string;
};

type AccountMemberRow = {
  account: AccountRow;
};

type AccountTransactionRow = {
  account_id: string | null;
  type: "income" | "expense" | null;
  amount: number;
};

export async function getMonthlySummary(
  month: number,
  year: number,
): Promise<MonthlyTransactionSummary> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: accountMembers, error: accountMembersError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("user_id", user.id);

  if (accountMembersError) {
    throw accountMembersError;
  }

  const accountIds = (accountMembers ?? [])
    .map((row) => row.account_id)
    .filter((id): id is string => Boolean(id));

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));

  let rows: TransactionAmountRow[] = [];

  if (accountIds.length > 0) {
    const { data, error } = await supabase
      .from("transactions")
      .select(
        "type,amount,category_name,category_icon,category_icon_pack,category_color",
      )
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", monthStart.toISOString())
      .lt("date", monthEnd.toISOString());

    if (error) {
      throw error;
    }

    rows = (data as TransactionAmountRow[]) ?? [];
  }

  const categoryTotalsByKey = new Map<string, CategoryTotal>();
  let totalIncome = 0;
  let totalSpending = 0;

  for (const row of rows) {
    const amount = Number(row.amount) || 0;

    if (row.type === "income") {
      totalIncome += amount;
    } else if (row.type === "expense") {
      totalSpending += amount;
    }

    if (!row.type || !row.category_name) {
      continue;
    }

    const key = `${row.type}:${row.category_name}`;
    const existing = categoryTotalsByKey.get(key);

    if (existing) {
      existing.total += amount;
      continue;
    }

    categoryTotalsByKey.set(key, {
      category: row.category_name,
      type: row.type,
      total: amount,
      category_icon: row.category_icon ?? undefined,
      category_icon_pack: row.category_icon_pack ?? undefined,
      category_color: row.category_color ?? undefined,
    });
  }

  const categoryTotals = Array.from(categoryTotalsByKey.values()).map(
    (categoryTotal) => ({
      ...categoryTotal,
      percentage:
        totalSpending > 0 ? (categoryTotal.total / totalSpending) * 100 : 0,
    }),
  );

  return {
    totalIncome,
    totalSpending,
    net: totalIncome - totalSpending,
    transactionCount: rows.length,
    categoryTotals,
  };
}

export async function getAccountsSummary(
  month: number,
  year: number,
): Promise<AccountMonthlySummary[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Accounts this user is a member of, with the details each card needs
  const { data: accountMembers, error: accountMembersError } = await supabase
    .from("account_members")
    .select("account:accounts!inner(id,name,type,currency)")
    .eq("user_id", user.id);

  if (accountMembersError) {
    throw accountMembersError;
  }

  const accounts = (
    (accountMembers as unknown as AccountMemberRow[]) ?? []
  ).map((row) => row.account);
  const accountIds = accounts.map((account) => account.id);

  const monthStart = new Date(Date.UTC(year, month - 1, 1));
  const monthEnd = new Date(Date.UTC(year, month, 1));

  let rows: AccountTransactionRow[] = [];

  if (accountIds.length > 0) {
    const { data, error } = await supabase
      .from("transactions")
      .select("account_id,type,amount")
      .in("account_id", accountIds)
      .eq("created_by", user.id)
      .gte("date", monthStart.toISOString())
      .lt("date", monthEnd.toISOString());

    if (error) {
      throw error;
    }

    rows = (data as AccountTransactionRow[]) ?? [];
  }

  const totalsByAccountId = new Map(
    accountIds.map((id) => [id, { income: 0, spending: 0, entryCount: 0 }]),
  );

  for (const row of rows) {
    const totals = row.account_id
      ? totalsByAccountId.get(row.account_id)
      : undefined;

    if (!totals) {
      continue;
    }

    const amount = Number(row.amount) || 0;

    if (row.type === "income") {
      totals.income += amount;
    } else if (row.type === "expense") {
      totals.spending += amount;
    }

    totals.entryCount += 1;
  }

  return accounts.map((account) => {
    const totals = totalsByAccountId.get(account.id) ?? {
      income: 0,
      spending: 0,
      entryCount: 0,
    };
    const balance = totals.income - totals.spending;

    return {
      id: account.id,
      name: account.name,
      type: account.type,
      currency: account.currency,
      entryCount: totals.entryCount,
      balance,
      income: totals.income,
      spending: totals.spending,
      savedPercentage: totals.income > 0 ? (balance / totals.income) * 100 : 0,
      spentPercentage:
        totals.income > 0 ? (totals.spending / totals.income) * 100 : 0,
    };
  });
}
