import { redirect } from "next/navigation";
import { createClient } from "../../../utils/supabase/server";
import { Category, Transaction, TransactionsByCategory } from "../../../types";
import LedgerGenerator from "./ledger-generator";

export const metadata = {
  title: "Ledger Generator",
};

type AccountMemberWithAccount = {
  account_id?: string;
  account: {
    id?: string;
    type: "single" | "shared" | "professional";
  }[];
};

function getPreviousYearRange() {
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

async function getPreviousYearTransactions(
  userId: string,
  categories: Category[],
  professionalAccountId: string | null,
) {
  if (!professionalAccountId) {
    const { previousYear } = getPreviousYearRange();
    return { previousYear, transactions: [] as Transaction[] };
  }

  const supabase = await createClient();
  const { previousYear, startIso, endIso } = getPreviousYearRange();
  const categoryNames = categories.map((category) => category.name);

  let query = supabase
    .from("transactions")
    .select(
      "id,title,account_id,type,category_id,category_name,category_icon,category_icon_pack,category_color,amount,currency,date,note,created_by,created_at,updated_at",
    )
    .eq("created_by", userId)
    .eq("account_id", professionalAccountId)
    .gte("date", startIso)
    .lt("date", endIso)
    .order("date", { ascending: true });

  if (categoryNames.length > 0) {
    query = query.in("category_name", categoryNames);
  }

  const { data: transactions, error } = await query;

  if (error) throw error;

  return {
    previousYear,
    transactions: (transactions ?? []) as Transaction[],
  };
}

function groupTransactionsByCategory(
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

export default async function LedgerGeneratorPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: membershipData, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id,account:accounts!inner(id,type)")
    .eq("user_id", user.id)
    .eq("account.type", "professional")
    .limit(1);

  if (membershipError) throw membershipError;

  const professionalAccountId =
    ((membershipData ?? []) as AccountMemberWithAccount[])[0]?.account_id ??
    null;

  const { data: categories, error: categoryError } = await supabase
    .from("categories")
    .select("id,name,type,color,icon,icon_pack")
    .eq("user_id", user.id)
    .eq("type", "professional");

  if (categoryError) throw categoryError;

  const categoryList = (categories ?? []) as Category[];
  const { previousYear, transactions } = await getPreviousYearTransactions(
    user.id,
    categoryList,
    professionalAccountId,
  );
  const transactionsByCategory = groupTransactionsByCategory(
    categoryList,
    transactions,
  );

  return (
    <LedgerGenerator
      categories={categoryList}
      previousYear={previousYear}
      transactionsByCategory={transactionsByCategory}
    />
  );
}
