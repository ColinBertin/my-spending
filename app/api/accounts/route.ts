import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

const ACCOUNT_TYPES = new Set(["single", "shared", "professional"]);
const CURRENCIES = new Set(["JPY", "EUR", "USD"]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const { name, type, currency } = body as {
    name?: unknown;
    type?: unknown;
    currency?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (typeof type !== "string" || !ACCOUNT_TYPES.has(type)) {
    return NextResponse.json(
      { error: "Account type must be single, shared, or professional" },
      { status: 400 },
    );
  }

  const normalizedCurrency =
    typeof currency === "string" ? currency.toUpperCase() : "";
  if (!CURRENCIES.has(normalizedCurrency)) {
    return NextResponse.json(
      { error: "Currency must be JPY, EUR, or USD" },
      { status: 400 },
    );
  }

  const admin = createAdminClient();

  const accountId = crypto.randomUUID();

  const { error: accErr } = await admin.from("accounts").insert({
    id: accountId,
    name: name.trim(),
    type,
    currency: normalizedCurrency,
  });
  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 400 });
  }

  const { error: memErr } = await admin.from("account_members").insert({
    account_id: accountId,
    user_id: user.id,
  });

  if (memErr) {
    return NextResponse.json({ error: memErr.message }, { status: 400 });
  }

  return NextResponse.json({ id: accountId }, { status: 201 });
}
