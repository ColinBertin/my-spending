import { NextResponse } from "next/server";
import { requireUser } from "@/utils/supabase/requireUser";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  const { user, supabase } = auth;

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

  const { name, color, icon, icon_pack, type } = body as {
    name?: unknown;
    color?: unknown;
    icon?: unknown;
    icon_pack?: unknown;
    type?: unknown;
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

  if (
    type !== undefined &&
    (typeof type !== "string" || (type !== "normal" && type !== "professional"))
  ) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
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

  const categoryId = crypto.randomUUID();

  const { error: accErr } = await supabase.from("categories").insert({
    id: categoryId,
    name: name.trim(),
    color: typeof color === "string" ? color.trim() : null,
    icon: typeof icon === "string" ? icon.trim() : null,
    icon_pack: typeof icon_pack === "string" ? icon_pack.trim() : null,
    type,
    user_id: user.id,
  });
  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 400 });
  }

  return NextResponse.json({ id: categoryId }, { status: 201 });
}

export async function PUT(req: Request) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  const { user, supabase } = auth;

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

  const { id, name, color, icon, icon_pack, type } = body as {
    id?: unknown;
    name?: unknown;
    color?: unknown;
    icon?: unknown;
    icon_pack?: unknown;
    type?: unknown;
  };

  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

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

  if (
    type !== undefined &&
    (typeof type !== "string" || (type !== "normal" && type !== "professional"))
  ) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
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

  const { data: existing, error: lookupErr } = await supabase
    .from("categories")
    .select("id,name,type")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (lookupErr) {
    return NextResponse.json({ error: lookupErr.message }, { status: 500 });
  }
  if (!existing) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (type !== undefined && type !== existing.type) {
    return NextResponse.json(
      { error: "Category type cannot be changed" },
      { status: 400 },
    );
  }

  // TODO: lift once ledgers match by category_id.
  if (existing.type === "professional" && name.trim() !== existing.name) {
    return NextResponse.json(
      { error: "Professional categories cannot be renamed" },
      { status: 400 },
    );
  }

  const { data: updated, error: accErr } = await supabase
    .from("categories")
    .update({
      name: name.trim(),
      ...(typeof color === "string" && { color: color.trim() }),
      ...(typeof icon === "string" && { icon: icon.trim() }),
      ...(typeof icon_pack === "string" && { icon_pack: icon_pack.trim() }),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id");

  if (accErr) {
    return NextResponse.json({ error: accErr.message }, { status: 400 });
  }

  if (!updated || updated.length === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ id }, { status: 200 });
}
