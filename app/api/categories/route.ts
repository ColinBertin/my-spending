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

  const { name, color, icon, icon_pack } = await req.json();

  const admin = createAdminClient();

  const categoryId = crypto.randomUUID();

  const { error: accErr } = await admin.from("categories").insert({
    id: categoryId,
    name,
    color,
    icon,
    icon_pack,
    user_id: user.id,
  });
  if (accErr)
    return NextResponse.json({ error: accErr.message }, { status: 400 });

  return NextResponse.json({ id: categoryId }, { status: 201 });
}
