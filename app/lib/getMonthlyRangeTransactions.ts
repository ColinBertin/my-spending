import { getMonthRange } from "@/helpers";
import { Transaction } from "@/types/firestore";
import { createClient } from "@/utils/supabase/client";
import {
  getMockTransactionsForAccountInRange,
  isMockEnabled,
} from "@/utils/mockData";
import { convertTransaction } from "./convertTransaction";

export async function getMonthlyRangeTransactions(
  accountId: string,
  selectedMonth: string,
  selectedYear: string,
): Promise<Transaction[]> {
  const { startOfMonth, endOfMonth } = getMonthRange(
    parseInt(selectedMonth),
    parseInt(selectedYear),
  );

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
