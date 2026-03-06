import type { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
// import { isMockEnabled, mockAuth } from "./mockData";
import type { AuthUser } from "./authTypes";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    user_metadata: user.user_metadata as AuthUser["user_metadata"],
    app_metadata: user.app_metadata as AuthUser["app_metadata"],
  };
}

export async function getAuthUser(): Promise<AuthUser | null> {
  // if (isMockEnabled()) {
  //   return mockAuth.getUser();
  // }

  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user ? toAuthUser(data.user) : null;
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  // if (isMockEnabled()) {
  //   return mockAuth.signIn({ email, password });
  // }

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
  // if (isMockEnabled()) {
  //   return mockAuth.signUp({ email, password, username });
  // }

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
  // if (isMockEnabled()) {
  //   return mockAuth.signOut();
  // }

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error: error?.message ?? null };
}

export async function signInWithOAuth(
  provider: "google" | "github",
  redirectTo: string,
): Promise<{ error: string | null }> {
  // if (isMockEnabled()) {
  //   const email = "demo@mock.local";
  //   await mockAuth.signIn({ email, password: "mock" });
  //   return { error: null };
  // }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo },
  });

  return { error: error?.message ?? null };
}
