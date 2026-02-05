import { getCurrentMonthRange } from "@/helpers";
import { Transaction } from "@/types/firestore";
import { createClient } from "@/utils/supabase/client";
import {
  getMockTransactionsForAccountInRange,
  isMockEnabled,
} from "@/utils/mockData";
import { convertTransaction } from "./convertTransaction";

export async function getThisMonthTransactions(
  accountId: string,
): Promise<Transaction[]> {
  const { startOfMonth, endOfMonth } = getCurrentMonthRange();

  if (isMockEnabled()) {
    return getMockTransactionsForAccountInRange(
      accountId,
      startOfMonth,
      endOfMonth,
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("accountId", accountId)
    .gte("date", startOfMonth.toISOString())
    .lte("date", endOfMonth.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => convertTransaction(row));
}
