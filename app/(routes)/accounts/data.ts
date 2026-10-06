import { cache } from "react";
import { redirect } from "next/navigation";
import { Account, AccountMemberRow, TransactionFlowRow } from "@/types";
import { createClient } from "@/utils/supabase/server";
import type { AccountSummary } from "./account-header";

function summarizeAccounts(
  accounts: Account[],
  transactions: TransactionFlowRow[],
): AccountSummary[] {
  return accounts
    .filter((account): account is Account & { id: string } =>
      Boolean(account.id),
    )
    .map((account) => {
      const accountTransactions = transactions.filter(
        (transaction) => transaction.account_id === account.id,
      );
      const income = accountTransactions
        .filter((transaction) => transaction.type === "income")
        .reduce((total, transaction) => total + transaction.amount, 0);
      const spending = accountTransactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((total, transaction) => total + transaction.amount, 0);
      const balance = income - spending;

      return {
        id: account.id,
        name: account.name,
        type: account.type,
        currency: account.currency,
        createdAt: account.created_at,
        entryCount: accountTransactions.length,
        balance,
        income,
        spending,
        savedPercentage: income > 0 ? (balance / income) * 100 : 0,
        spentPercentage: income > 0 ? (spending / income) * 100 : 0,
      };
    });
}

// Shared by layout.tsx and page.tsx; cache() dedupes the queries per request.
export const getAccountsMonthlySummary = cache(
  async (): Promise<AccountSummary[]> => {
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

    // Fetch current month transactions
    let flowRows: TransactionFlowRow[] = [];

    if (accountIds.length > 0) {
      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("type,amount,date,account_id")
        .in("account_id", accountIds)
        .eq("created_by", user.id)
        .gte("date", currentMonthStart.toISOString())
        .lt("date", currentMonthEnd.toISOString());

      if (transactionError) {
        throw transactionError;
      }

      flowRows = (transactionData as TransactionFlowRow[]) ?? [];
    }

    return summarizeAccounts(accounts, flowRows);
  },
);
