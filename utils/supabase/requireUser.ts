import type { SupabaseClient, User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";
import { createClient } from "./server";

export type RequireUserResult =
  | { ok: true; user: User; supabase: SupabaseClient }
  | { ok: false; response: NextResponse };

export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { ok: true, user, supabase };
}

export const requirePageUser = cache(
  async (): Promise<{ user: User; supabase: SupabaseClient }> => {
    const auth = await requireUser();
    if (!auth.ok) {
      redirect("/login");
    }
    return { user: auth.user, supabase: auth.supabase };
  },
);
