import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { createAdminClient } from "../../../../utils/supabase/admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

async function getAuthorizedAccount(accountId: string, userId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: account, error: accountError } = await admin
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
      error: NextResponse.json(
        { error: "You do not have access to this account" },
        { status: 403 },
      ),
    };
  }

  return { account, admin };
}

export async function DELETE(req: Request, context: RouteContext) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const authorized = await getAuthorizedAccount(id, user.id);
  if ("error" in authorized) {
    return authorized.error;
  }

  const { account, admin } = authorized;

  if (account.name !== confirmName.trim()) {
    return NextResponse.json(
      { error: "Confirmation name does not match" },
      { status: 400 },
    );
  }

  const { error: transactionError } = await admin
    .from("transactions")
    .delete()
    .eq("account_id", id);

  if (transactionError) {
    return NextResponse.json(
      { error: transactionError.message },
      { status: 400 },
    );
  }

  const { error: membershipError } = await admin
    .from("account_members")
    .delete()
    .eq("account_id", id);

  if (membershipError) {
    return NextResponse.json(
      { error: membershipError.message },
      { status: 400 },
    );
  }

  const { error: accountError } = await admin
    .from("accounts")
    .delete()
    .eq("id", id);

  if (accountError) {
    return NextResponse.json({ error: accountError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
