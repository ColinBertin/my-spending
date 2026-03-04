import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { Category, Transaction, TransactionsByCategory } from "../../../types";

type AccountMemberWithAccount = {
  account_id?: string;
  account: {
    id?: string;
    type: "single" | "shared" | "professional";
  }[];
};

type LedgerRange = {
  startIso: string;
  endIso: string;
};

export type ProfessionalLedgerContext = {
  userId: string;
  professionalAccountId: string | null;
  categories: Category[];
};

export function getPreviousYearRange() {
  const currentYear = new Date().getUTCFullYear();
  const previousYear = currentYear - 1;
  const start = new Date(Date.UTC(previousYear, 0, 1, 0, 0, 0));
  const end = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));

  return {
    previousYear,
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  };
}

export function getPreviousMonthRange() {
  const now = new Date();
  const currentMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0),
  );
  const previousMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0),
  );

  return {
    year: previousMonthStart.getUTCFullYear(),
    month: previousMonthStart.getUTCMonth() + 1,
    startIso: previousMonthStart.toISOString(),
    endIso: currentMonthStart.toISOString(),
  };
}

export async function getProfessionalLedgerContext(): Promise<ProfessionalLedgerContext> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membershipData, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id,account:accounts!inner(id,type)")
    .eq("user_id", user.id)
    .eq("account.type", "professional")
    .limit(1);

  if (membershipError) {
    throw membershipError;
  }

  const professionalAccountId =
    ((membershipData ?? []) as AccountMemberWithAccount[])[0]?.account_id ??
    null;

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,type,color,icon,icon_pack")
    .eq("user_id", user.id)
    .eq("type", "professional");

  if (categoryError) {
    throw categoryError;
  }

  return {
    userId: user.id,
    professionalAccountId,
    categories: (categories ?? []) as Category[],
  };
}

export async function getTransactionsForRange(
  userId: string,
  categories: Category[],
  professionalAccountId: string | null,
  range: LedgerRange,
) {
  if (!professionalAccountId) {
    return [] as Transaction[];
  }

  const supabase = await createClient();
  const categoryNames = categories.map((category) => category.name);

  let query = supabase
    .from("transactions")
    .select(
      "id,title,account_id,type,category_id,category_name,category_icon,category_icon_pack,category_color,amount,currency,date,note,created_by,created_at,updated_at",
    )
    .eq("created_by", userId)
    .eq("account_id", professionalAccountId)
    .gte("date", range.startIso)
    .lt("date", range.endIso)
    .order("date", { ascending: true });

  if (categoryNames.length > 0) {
    query = query.in("category_name", categoryNames);
  }

  const { data: transactions, error } = await query;

  if (error) {
    throw error;
  }

  return (transactions ?? []) as Transaction[];
}

export function groupTransactionsByCategory(
  categories: Category[],
  transactions: Transaction[],
) {
  const initialGrouped: TransactionsByCategory = Object.fromEntries(
    categories.map((category) => [category.name, [] as Transaction[]]),
  );

  for (const transaction of transactions) {
    if (!initialGrouped[transaction.category_name]) {
      initialGrouped[transaction.category_name] = [];
    }
    initialGrouped[transaction.category_name].push(transaction);
  }

  return initialGrouped;
}
