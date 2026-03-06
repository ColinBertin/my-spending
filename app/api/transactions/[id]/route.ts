import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  deleteMockTransactionForUser,
  getMockCategoryByIdForUser,
  getMockTransactionByIdForUser,
  hasMockAccountAccess,
  MOCK_USER_ID,
  updateMockTransactionForUser,
} from "@/utils/mock/data";
import { isMockEnabled } from "@/utils/mock/env";

const TRANSACTION_TYPES = new Set(["income", "expense"]);
const CURRENCIES = new Set(["JPY", "EUR", "USD"]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

type CategoryRecord = {
  id: string;
  name: string;
  icon: string | null;
  icon_pack: string | null;
  color: string | null;
};

async function getAuthorizedTransaction(transactionId: string, userId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: transaction, error: transactionError } = await admin
    .from("transactions")
    .select("id,title,account_id,created_by")
    .eq("id", transactionId)
    .eq("created_by", userId)
    .maybeSingle();

  if (transactionError) {
    return {
      error: NextResponse.json(
        { error: transactionError.message },
        { status: 400 },
      ),
    };
  }

  if (!transaction) {
    return {
      error: NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      ),
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("account_id", transaction.account_id)
    .eq("user_id", userId)
    .maybeSingle();

  if (membershipError) {
    return {
      error: NextResponse.json(
        { error: membershipError.message },
        { status: 400 },
      ),
    };
  }

  if (!membership) {
    return {
      error: NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      ),
    };
  }

  return { admin, transaction };
}

async function getCategoryForUser(categoryId: string, userId: string) {
  const supabase = await createClient();
  const { data: category, error } = await supabase
    .from("categories")
    .select("id,name,icon,icon_pack,color")
    .eq("id", categoryId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      error: NextResponse.json({ error: error.message }, { status: 400 }),
    };
  }

  if (!category) {
    return {
      error: NextResponse.json(
        { error: "Invalid category_id for this user" },
        { status: 400 },
      ),
    };
  }

  return { category: category as CategoryRecord };
}

export async function PATCH(req: Request, context: RouteContext) {
  const { id } = await context.params;

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

  const { title, type, currency, amount, date, category_id } = body as {
    title?: unknown;
    type?: unknown;
    currency?: unknown;
    amount?: unknown;
    date?: unknown;
    category_id?: unknown;
  };

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
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

  const parsedDate = new Date(typeof date === "string" ? date : "");
  if (Number.isNaN(parsedDate.getTime())) {
    return NextResponse.json({ error: "date is invalid" }, { status: 400 });
  }

  if (typeof category_id !== "string" || !category_id.trim()) {
    return NextResponse.json(
      { error: "category_id is required" },
      { status: 400 },
    );
  }

  if (isMockEnabled()) {
    const transaction = getMockTransactionByIdForUser(id, MOCK_USER_ID);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (
      !transaction.account_id ||
      !hasMockAccountAccess(transaction.account_id, MOCK_USER_ID)
    ) {
      return NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      );
    }

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

    const updated = updateMockTransactionForUser(
      id,
      {
        title: title.trim(),
        type: normalizedType as "income" | "expense",
        currency: normalizedCurrency,
        amount: numericAmount,
        date: parsedDate,
        category_id: category.id,
        category_name: category.name,
        category_icon: category.icon ?? null,
        category_icon_pack: category.icon_pack ?? null,
        category_color: category.color ?? null,
      },
      MOCK_USER_ID,
    );

    if (!updated) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorized = await getAuthorizedTransaction(id, user.id);
  if ("error" in authorized) {
    return authorized.error;
  }

  const categoryResult = await getCategoryForUser(category_id.trim(), user.id);
  if ("error" in categoryResult) {
    return categoryResult.error;
  }

  const { admin } = authorized;
  const { category } = categoryResult;

  const { error } = await admin
    .from("transactions")
    .update({
      title: title.trim(),
      type: normalizedType,
      currency: normalizedCurrency,
      amount: numericAmount,
      date: parsedDate.toISOString(),
      category_id: category.id,
      category_name: category.name,
      category_icon: category.icon,
      category_icon_pack: category.icon_pack,
      category_color: category.color,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(req: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const confirmTitle =
    body && typeof body === "object" && "confirmTitle" in body
      ? (body as { confirmTitle?: unknown }).confirmTitle
      : undefined;

  if (typeof confirmTitle !== "string" || !confirmTitle.trim()) {
    return NextResponse.json(
      { error: "confirmTitle is required" },
      { status: 400 },
    );
  }

  if (isMockEnabled()) {
    const transaction = getMockTransactionByIdForUser(id, MOCK_USER_ID);
    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 },
      );
    }

    if (
      !transaction.account_id ||
      !hasMockAccountAccess(transaction.account_id, MOCK_USER_ID)
    ) {
      return NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      );
    }

    if (transaction.title !== confirmTitle.trim()) {
      return NextResponse.json(
        { error: "Confirmation title does not match" },
        { status: 400 },
      );
    }

    deleteMockTransactionForUser(id, MOCK_USER_ID);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const authorized = await getAuthorizedTransaction(id, user.id);
  if ("error" in authorized) {
    return authorized.error;
  }

  const { admin, transaction } = authorized;

  if (transaction.title !== confirmTitle.trim()) {
    return NextResponse.json(
      { error: "Confirmation title does not match" },
      { status: 400 },
    );
  }

  const { error } = await admin
    .from("transactions")
    .delete()
    .eq("id", id)
    .eq("created_by", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
