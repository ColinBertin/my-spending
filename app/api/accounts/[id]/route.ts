import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { requireUser } from "@/utils/supabase/requireUser";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAuthorizedAccount(
  supabase: SupabaseClient,
  accountId: string,
  userId: string,
) {
  const { data: membership, error: membershipError } = await supabase
    .from("account_members")
    .select("account_id")
    .eq("account_id", accountId)
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
      error: NextResponse.json({ error: "Account not found" }, { status: 404 }),
    };
  }

  const { data: account, error: accountError } = await supabase
    .from("accounts")
    .select("id,name")
    .eq("id", accountId)
    .maybeSingle();

  if (accountError) {
    return {
      error: NextResponse.json(
        { error: accountError.message },
        { status: 400 },
      ),
    };
  }

  if (!account) {
    return {
      error: NextResponse.json({ error: "Account not found" }, { status: 404 }),
    };
  }

  return { account };
}

export async function DELETE(req: Request, context: RouteContext) {
  const auth = await requireUser();
  if (!auth.ok) {
    return auth.response;
  }
  const { user, supabase } = auth;

  const { id } = await context.params;

  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const confirmName =
    body && typeof body === "object" && "confirmName" in body
      ? (body as { confirmName?: unknown }).confirmName
      : undefined;

  if (typeof confirmName !== "string" || !confirmName.trim()) {
    return NextResponse.json(
      { error: "confirmName is required" },
      { status: 400 },
    );
  }

  const authorized = await getAuthorizedAccount(supabase, id, user.id);
  if ("error" in authorized) {
    return authorized.error;
  }

  const { account } = authorized;

  if (account.name !== confirmName.trim()) {
    return NextResponse.json(
      { error: "Confirmation name does not match" },
      { status: 400 },
    );
  }

  // Transactions and memberships are removed by the on delete cascade FKs.
  // Deleting the membership first would revoke the caller's access to the account under RLS.
  const { error: accountError } = await supabase
    .from("accounts")
    .delete()
    .eq("id", id);

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
