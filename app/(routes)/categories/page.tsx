import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Category } from "@/types";
import CategoriesList from "./categories-list";
import { buildCategoriesOverview, CategoryUsageRow } from "./category-cards";

export const metadata = {
  title: "Categories",
};

// Matches `max_rows` in supabase/config.toml so usage rows are paged, not truncated.
const USAGE_PAGE_SIZE = 1000;

type AccountMemberRow = {
  account: { id: string; name: string } | null;
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [categoriesResult, membershipsResult] = await Promise.all([
    supabase
      .from("categories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("account_members")
      .select("account:accounts!inner(id,name)")
      .eq("user_id", user.id),
  ]);

  if (categoriesResult.error) {
    throw categoriesResult.error;
  }
  if (membershipsResult.error) {
    throw membershipsResult.error;
  }

  const categories = (categoriesResult.data ?? []) as Category[];
  const accountNames = new Map<string, string>();
  for (const row of (membershipsResult.data ??
    []) as unknown as AccountMemberRow[]) {
    if (row.account?.id) {
      accountNames.set(row.account.id, row.account.name);
    }
  }
  const accountIds = Array.from(accountNames.keys());

  const usageRows: CategoryUsageRow[] = [];
  if (categories.length > 0 && accountIds.length > 0) {
    for (let from = 0; ; from += USAGE_PAGE_SIZE) {
      const { data, error } = await supabase
        .from("transactions")
        .select("account_id,category_id,category_name,amount,currency")
        .in("account_id", accountIds)
        .eq("created_by", user.id)
        .order("id", { ascending: true })
        .range(from, from + USAGE_PAGE_SIZE - 1);

      if (error) {
        throw error;
      }

      const page = (data ?? []) as CategoryUsageRow[];
      usageRows.push(...page);
      if (page.length < USAGE_PAGE_SIZE) {
        break;
      }
    }
  }

  const { cards, meta } = buildCategoriesOverview(
    categories,
    usageRows,
    accountNames,
  );

  return <CategoriesList cards={cards} meta={meta} />;
}
