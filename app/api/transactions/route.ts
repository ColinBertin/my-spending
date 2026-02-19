import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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
