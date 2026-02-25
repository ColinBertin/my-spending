import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CategoryTotal } from "@/types";
import {
  createMockTransactionForUser,
  getMockCategoryByIdForUser,
  hasMockAccountAccess,
  listMockTransactionsForAccount,
  MOCK_USER_ID,
} from "@/utils/mock/data";
import { isMockEnabled } from "@/utils/mock/env";

const TRANSACTION_TYPES = new Set(["income", "expense"]);
const CURRENCIES = new Set(["JPY", "EUR", "USD"]);

function getMonthRange(
  selectedMonthStr: string,
  selectedYearStr: string,
): { start: string; end: string } | { error: string } {
  const month = Number(selectedMonthStr);
  const year = Number(selectedYearStr);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "selectedMonth must be an integer between 1 and 12" };
  }

  if (!Number.isInteger(year) || year < 1970 || year > 9999) {
    return { error: "selectedYear must be a valid 4-digit year" };
  }

  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0));

  return { start: start.toISOString(), end: end.toISOString() };
}

function buildCategoryTotals(
  transactions: Array<{
    category_name: string | null;
    amount: number;
    category_icon?: string | null;
    category_icon_pack?: string | null;
    category_color?: string | null;
  }>,
): CategoryTotal[] {
  const categoryTotalsMap = new Map<string, CategoryTotal>();

  for (const transaction of transactions) {
    if (!transaction.category_name) continue;

    const existingCategory = categoryTotalsMap.get(transaction.category_name);

    if (existingCategory) {
      existingCategory.total += Number(transaction.amount);

      if (!existingCategory.category_icon && transaction.category_icon) {
        existingCategory.category_icon = transaction.category_icon;
      }
      if (
        !existingCategory.category_icon_pack &&
        transaction.category_icon_pack
      ) {
        existingCategory.category_icon_pack = transaction.category_icon_pack;
      }
      if (!existingCategory.category_color && transaction.category_color) {
        existingCategory.category_color = transaction.category_color;
      }

      continue;
    }

    categoryTotalsMap.set(transaction.category_name, {
      category: transaction.category_name,
      total: Number(transaction.amount),
      category_icon: transaction.category_icon ?? undefined,
      category_icon_pack: transaction.category_icon_pack ?? undefined,
      category_color: transaction.category_color ?? undefined,
    });
  }

  return Array.from(categoryTotalsMap.values()).sort((a, b) =>
    a.category.localeCompare(b.category),
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const accountId = searchParams.get("accountId")?.trim();
  const selectedMonthStr = searchParams.get("selectedMonth");
  const selectedYearStr = searchParams.get("selectedYear");
  const summary = searchParams.get("summary") === "true";

  if (!accountId) {
    return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
  }

  const hasMonth = selectedMonthStr !== null;
  const hasYear = selectedYearStr !== null;
  if (hasMonth !== hasYear) {
    return NextResponse.json(
      { error: "selectedMonth and selectedYear must be provided together" },
      { status: 400 },
    );
  }

  let monthRange: { start: string; end: string } | null = null;
  if (selectedMonthStr && selectedYearStr) {
    const maybeRange = getMonthRange(selectedMonthStr, selectedYearStr);
    if ("error" in maybeRange) {
      return NextResponse.json({ error: maybeRange.error }, { status: 400 });
    }
    monthRange = maybeRange;
  }

  if (isMockEnabled()) {
    if (!hasMockAccountAccess(accountId, MOCK_USER_ID)) {
      return NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      );
    }

    const transactions = listMockTransactionsForAccount({
      accountId,
      userId: MOCK_USER_ID,
      selectedMonth: selectedMonthStr ?? undefined,
      selectedYear: selectedYearStr ?? undefined,
    });

    if (summary) {
      const categoryTotals = buildCategoryTotals(transactions);

      return NextResponse.json(
        {
          categoryTotals,
          totalSpending: categoryTotals.reduce(
            (acc, item) => acc + item.total,
            0,
          ),
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ transactions }, { status: 200 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("account_id", accountId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 400 },
    );
  }

  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this account" },
      { status: 403 },
    );
  }

  const admin = createAdminClient();
  if (summary) {
    let query = admin
      .from("transactions")
      .select(
        "category_name,amount,category_icon,category_icon_pack,category_color",
      )
      .eq("account_id", accountId)
      .eq("created_by", user.id);

    if (monthRange) {
      query = query.gte("date", monthRange.start).lt("date", monthRange.end);
    }

    const { data: transactions, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const categoryTotals = buildCategoryTotals(transactions ?? []);

    return NextResponse.json(
      {
        categoryTotals,
        totalSpending: categoryTotals.reduce(
          (acc, item) => acc + item.total,
          0,
        ),
      },
      { status: 200 },
    );
  }

  let query = admin
    .from("transactions")
    .select(
      "id,account_id,created_by,title,type,category_name,category_icon,category_icon_pack,category_color,amount,currency,date,note,created_at",
    )
    .eq("account_id", accountId)
    .eq("created_by", user.id);

  if (monthRange) {
    query = query.gte("date", monthRange.start).lt("date", monthRange.end);
  }

  const { data: transactions, error } = await query.order("date", {
    ascending: true,
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json(
    { transactions: transactions ?? [] },
    { status: 200 },
  );
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const {
    title,
    type,
    currency,
    amount,
    note,
    date,
    account_id,
    category_id,
    category_name,
    category_icon,
    category_icon_pack,
    category_color,
  } = body as {
    title?: unknown;
    type?: unknown;
    currency?: unknown;
    amount?: unknown;
    note?: unknown;
    date?: unknown;
    account_id?: unknown;
    category_id?: unknown;
    category_name?: unknown;
    category_icon?: unknown;
    category_icon_pack?: unknown;
    category_color?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  if (typeof account_id !== "string" || !account_id.trim()) {
    return NextResponse.json(
      { error: "account_id is required" },
      { status: 400 },
    );
  }

  const normalizedType = typeof type === "string" ? type.toLowerCase() : "";
  if (!TRANSACTION_TYPES.has(normalizedType)) {
    return NextResponse.json(
      { error: "type must be income or expense" },
      { status: 400 },
    );
  }

  const normalizedCurrency =
    typeof currency === "string" ? currency.toUpperCase() : "";
  if (!CURRENCIES.has(normalizedCurrency)) {
    return NextResponse.json(
      { error: "currency must be JPY, EUR, or USD" },
      { status: 400 },
    );
  }

  const numericAmount =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount)
        : NaN;
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return NextResponse.json(
      { error: "amount must be a positive number" },
      { status: 400 },
    );
  }

  const parsedDate = new Date(date as string);
  if (!date || Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "date is invalid" }, { status: 400 });
  }

  if (note !== undefined && typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string" },
      { status: 400 },
    );
  }

  if (category_id !== undefined && typeof category_id !== "string") {
    return NextResponse.json(
      { error: "category_id must be a string" },
      { status: 400 },
    );
  }

  if (category_name !== undefined && typeof category_name !== "string") {
    return NextResponse.json(
      { error: "category_name must be a string" },
      { status: 400 },
    );
  }

  if (category_icon !== undefined && typeof category_icon !== "string") {
    return NextResponse.json(
      { error: "category_icon must be a string" },
      { status: 400 },
    );
  }

  if (
    category_icon_pack !== undefined &&
    typeof category_icon_pack !== "string"
  ) {
    return NextResponse.json(
      { error: "category_icon_pack must be a string" },
      { status: 400 },
    );
  }

  if (category_color !== undefined && typeof category_color !== "string") {
    return NextResponse.json(
      { error: "category_color must be a string" },
      { status: 400 },
    );
  }

  const hasCategoryIcon =
    typeof category_icon === "string" && category_icon.trim().length > 0;
  const hasCategoryIconPack =
    typeof category_icon_pack === "string" &&
    category_icon_pack.trim().length > 0;

  if (hasCategoryIcon !== hasCategoryIconPack) {
    return NextResponse.json(
      {
        error: "category_icon and category_icon_pack must be provided together",
      },
      { status: 400 },
    );
  }

  if (isMockEnabled()) {
    if (!hasMockAccountAccess(account_id.trim(), MOCK_USER_ID)) {
      return NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      );
    }

    if (typeof category_id === "string" && category_id.trim()) {
      const category = getMockCategoryByIdForUser(
        category_id.trim(),
        MOCK_USER_ID,
      );
      if (!category) {
        return NextResponse.json(
          { error: "Invalid category_id for this user" },
          { status: 400 },
        );
      }
    }

    const { id } = createMockTransactionForUser(
      {
        category_id:
          typeof category_id === "string" && category_id.trim()
            ? category_id.trim()
            : null,
        category_name:
          typeof category_name === "string" ? category_name.trim() : null,
        title: title.trim(),
        type: normalizedType as "income" | "expense",
        currency: normalizedCurrency,
        amount: numericAmount,
        note: typeof note === "string" ? note.trim() : undefined,
        date: parsedDate,
        account_id: account_id.trim(),
        category_icon:
          typeof category_icon === "string" ? category_icon.trim() : null,
        category_icon_pack:
          typeof category_icon_pack === "string"
            ? category_icon_pack.trim()
            : null,
        category_color:
          typeof category_color === "string" ? category_color.trim() : null,
      },
      MOCK_USER_ID,
    );

    return NextResponse.json({ id }, { status: 201 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("account_id", account_id.trim())
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 400 },
    );
  }

  if (!membership) {
    return NextResponse.json(
      { error: "You do not have access to this account" },
      { status: 403 },
    );
  }

  if (typeof category_id === "string" && category_id.trim()) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category_id.trim())
      .eq("user_id", user.id)
      .maybeSingle();

    if (categoryError) {
      return NextResponse.json(
        { error: categoryError.message },
        { status: 400 },
      );
    }

    if (!category) {
      return NextResponse.json(
        { error: "Invalid category_id for this user" },
        { status: 400 },
      );
    }
  }

  const admin = createAdminClient();

  const transactionId = crypto.randomUUID();

  const { error } = await admin
    .from("transactions")
    .insert({
      id: transactionId,
      category_id:
        typeof category_id === "string" && category_id.trim()
          ? category_id.trim()
          : null,
      category_name:
        typeof category_name === "string" ? category_name.trim() : null,
      title: title.trim(),
      type: normalizedType,
      currency: normalizedCurrency,
      amount: numericAmount,
      note: typeof note === "string" ? note.trim() : null,
      date: parsedDate.toISOString(),
      account_id: account_id.trim(),
      created_by: user.id,
      created_at: new Date().toISOString(),
      category_icon:
        typeof category_icon === "string" ? category_icon.trim() : null,
      category_icon_pack:
        typeof category_icon_pack === "string"
          ? category_icon_pack.trim()
          : null,
      category_color:
        typeof category_color === "string" ? category_color.trim() : null,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: transactionId }, { status: 201 });
}
