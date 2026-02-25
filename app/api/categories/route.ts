import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createMockCategoryForUser, MOCK_USER_ID } from "@/utils/mock/data";
import { isMockEnabled } from "@/utils/mock/env";

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

  const { name, color, icon, icon_pack } = body as {
    name?: unknown;
    color?: unknown;
    icon?: unknown;
    icon_pack?: unknown;
  };

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (color !== undefined && (typeof color !== "string" || !color.trim())) {
    return NextResponse.json({ error: "Invalid color" }, { status: 400 });
  }

  if (icon !== undefined && (typeof icon !== "string" || !icon.trim())) {
    return NextResponse.json({ error: "Invalid icon" }, { status: 400 });
  }

  if (
    icon_pack !== undefined &&
    (typeof icon_pack !== "string" || !icon_pack.trim())
  ) {
    return NextResponse.json({ error: "Invalid icon pack" }, { status: 400 });
  }

  const hasIcon = typeof icon === "string" && icon.trim().length > 0;
  const hasIconPack =
    typeof icon_pack === "string" && icon_pack.trim().length > 0;
  if (hasIcon !== hasIconPack) {
    return NextResponse.json(
      { error: "Icon and icon pack must be provided together" },
      { status: 400 },
    );
  }

  if (isMockEnabled()) {
    const { id } = createMockCategoryForUser(
      {
        name: name.trim(),
        color: typeof color === "string" ? color.trim() : null,
        icon: typeof icon === "string" ? icon.trim() : null,
        icon_pack: typeof icon_pack === "string" ? icon_pack.trim() : null,
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

  const admin = createAdminClient();

  const categoryId = crypto.randomUUID();

  const { error: accErr } = await admin.from("categories").insert({
    id: categoryId,
    name: name.trim(),
    color: typeof color === "string" ? color.trim() : null,
    icon: typeof icon === "string" ? icon.trim() : null,
    icon_pack: typeof icon_pack === "string" ? icon_pack.trim() : null,
    user_id: user.id,
  });
  if (accErr)
    return NextResponse.json({ error: accErr.message }, { status: 400 });

  return NextResponse.json({ id: categoryId }, { status: 201 });
}
