import type { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { AuthUser } from "@/utils/authTypes";
import { isMockEnabled } from "@/utils/mock/env";
import {
  getMockAuthUser,
  mockSignInWithOAuth,
  mockSignInWithPassword,
  mockSignOut,
  mockSignUpWithPassword,
} from "@/utils/mock/auth";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    user_metadata: user.user_metadata as AuthUser["user_metadata"],
    app_metadata: user.app_metadata as AuthUser["app_metadata"],
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  if (isMockEnabled()) {
    return getMockAuthUser();
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (isMockEnabled()) {
    return mockSignInWithPassword(email);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user ? toAuthUser(data.user) : null,
    error: error?.message ?? null,
  };
}

export async function signUpWithPassword(
  email: string,
  password: string,
  username: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  if (isMockEnabled()) {
    return mockSignUpWithPassword(email, username);
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
    },
  });

  return {
    user: data.user ? toAuthUser(data.user) : null,
    error: error?.message ?? null,
  };
}

export async function signOut(): Promise<{ error: string | null }> {
  if (isMockEnabled()) {
    return mockSignOut();
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function signInWithOAuth(
  provider: "google" | "github",
  redirectTo: string,
): Promise<{ error: string | null }> {
  if (isMockEnabled()) {
    return mockSignInWithOAuth(provider);
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  return { error: error?.message ?? null };
}
