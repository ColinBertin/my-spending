import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, type, currency } = await req.json();

  if (!name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  if (!type) {
    return Response.json(
      { error: "Account type is required" },
      { status: 400 },
    );
  }

  if (!currency) {
    return Response.json({ error: "Currency is required" }, { status: 400 });
  }

  const admin = createAdminClient();

  const accountId = crypto.randomUUID();

  const { error: accErr } = await admin.from("accounts").insert({
    id: accountId,
    name,
    type,
    currency,
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
