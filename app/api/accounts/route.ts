import { NextResponse } from "next/server";
import { requireUser } from "@/utils/supabase/requireUser";

const ACCOUNT_TYPES = new Set(["single", "shared", "professional"]);
const CURRENCIES = new Set(["JPY", "EUR", "USD"]);

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  const { supabase } = auth;

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

  const accountId = crypto.randomUUID();

  // The add_account_creator_as_member trigger adds the caller to account_members.
  const { error: accErr } = await supabase.from("accounts").insert({
    id: accountId,
    name: name.trim(),
    type,
    currency: normalizedCurrency,
  });
  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 400 });
  }

  return NextResponse.json({ id: accountId }, { status: 201 });
}
