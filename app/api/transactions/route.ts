import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { CategoryTotal } from "@/types";

export async function GET(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);

  const accountId = searchParams.get("accountId");
  const selectedMonthStr = searchParams.get("selectedMonth"); // "1".."12" or "0".."11" (see note)
  const selectedYearStr = searchParams.get("selectedYear");
  const summary = searchParams.get("summary") === "true";

  if (!accountId) {
    return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
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

    if (selectedMonthStr && selectedYearStr) {
      const month = Number(selectedMonthStr);
      const year = Number(selectedYearStr);

      if (!Number.isFinite(month) || !Number.isFinite(year)) {
        return NextResponse.json(
          { error: "Invalid month/year" },
          { status: 400 },
        );
      }

      const m = month - 1;

      const start = new Date(Date.UTC(year, m, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, m + 1, 1, 0, 0, 0));

      query = query
        .gte("date", start.toISOString())
        .lt("date", end.toISOString());
    }

    const { data: transactions, error } = await query;

    if (error)
      return NextResponse.json({ error: error.message }, { status: 400 });

    const categoryTotalsMap = new Map<string, CategoryTotal>();

    for (const transaction of transactions ?? []) {
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

    const categoryTotals = Array.from(categoryTotalsMap.values()).sort((a, b) =>
      a.category.localeCompare(b.category),
    );

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

  if (selectedMonthStr && selectedYearStr) {
    const month = Number(selectedMonthStr);
    const year = Number(selectedYearStr);

    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      return NextResponse.json(
        { error: "Invalid month/year" },
        { status: 400 },
      );
    }

    const m = month - 1;

    const start = new Date(Date.UTC(year, m, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, m + 1, 1, 0, 0, 0));

    query = query
      .gte("date", start.toISOString())
      .lt("date", end.toISOString());
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
  } = await req.json();

  const admin = createAdminClient();

  const transactionId = crypto.randomUUID();

  const { error } = await admin
    .from("transactions")
    .insert({
      id: transactionId,
      category_id,
      category_name,
      title,
      type,
      currency,
      amount: parseInt(amount as unknown as string, 10),
      note,
      date: date instanceof Date ? date.toISOString() : date,
      account_id,
      created_by: user.id,
      created_at: new Date().toISOString(),
      category_icon,
      category_icon_pack,
      category_color,
    })
    .select("id")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ id: transactionId }, { status: 201 });
}
