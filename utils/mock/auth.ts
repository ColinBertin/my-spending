"use client";

import type { AuthUser } from "@/utils/authTypes";
import { MOCK_USER_ID } from "./constants";

const MOCK_AUTH_USER_KEY = "my-spending:mock-auth-user";
const MOCK_AUTH_SIGNED_OUT_KEY = "my-spending:mock-auth-signed-out";
const MOCK_AUTH_CHANGE_EVENT = "my-spending:mock-auth-change";

const DEFAULT_MOCK_USER: AuthUser = {
  id: MOCK_USER_ID,
  email: "demo@mock.local",
  user_metadata: { username: "demo" },
  app_metadata: { provider: "email" },
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function emitAuthChange() {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(MOCK_AUTH_CHANGE_EVENT));
}

function readStoredUser(): AuthUser | null {
  if (!isBrowser()) return DEFAULT_MOCK_USER;

  const raw = window.localStorage.getItem(MOCK_AUTH_USER_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.id) return null;
    return parsed;
  } catch {
    window.localStorage.removeItem(MOCK_AUTH_USER_KEY);
    return null;
  }
}

function storeUser(user: AuthUser | null, emit = true) {
  if (!isBrowser()) return;

  if (user) {
    window.localStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user));
    window.localStorage.removeItem(MOCK_AUTH_SIGNED_OUT_KEY);
  } else {
    window.localStorage.removeItem(MOCK_AUTH_USER_KEY);
    window.localStorage.setItem(MOCK_AUTH_SIGNED_OUT_KEY, "1");
  }

  if (emit) emitAuthChange();
}

function buildUserFromEmail(email: string, username?: string): AuthUser {
  const trimmedEmail = email.trim().toLowerCase();
  const derivedUserName =
    username?.trim() || trimmedEmail.split("@")[0] || "demo";

  return {
    id: MOCK_USER_ID,
    email: trimmedEmail,
    user_metadata: { username: derivedUserName },
    app_metadata: { provider: "email" },
  };
}

export function getMockAuthUser(): AuthUser | null {
  const stored = readStoredUser();
  if (stored) return stored;

  if (!isBrowser()) return DEFAULT_MOCK_USER;

  const isExplicitlySignedOut =
    window.localStorage.getItem(MOCK_AUTH_SIGNED_OUT_KEY) === "1";
  if (isExplicitlySignedOut) return null;

  storeUser(DEFAULT_MOCK_USER, false);
  return DEFAULT_MOCK_USER;
}

export async function mockSignInWithPassword(
  email: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const user = buildUserFromEmail(email);
  storeUser(user);
  return { user, error: null };
}

export async function mockSignUpWithPassword(
  email: string,
  username: string,
): Promise<{ user: AuthUser | null; error: string | null }> {
  const user = buildUserFromEmail(email, username);
  storeUser(user);
  return { user, error: null };
}

export async function mockSignOut(): Promise<{ error: string | null }> {
  storeUser(null);
  return { error: null };
}

export async function mockSignInWithOAuth(
  provider: "google" | "github",
): Promise<{ error: string | null }> {
  const email =
    provider === "google" ? "google-user@mock.local" : "github-user@mock.local";
  const user = buildUserFromEmail(email);
  storeUser({
    ...user,
    app_metadata: { provider },
  });

  return { error: null };
}

export function subscribeToMockAuthChanges(
  callback: (user: AuthUser | null) => void,
): () => void {
  if (!isBrowser()) return () => undefined;

  const handler = () => callback(getMockAuthUser());
  window.addEventListener(MOCK_AUTH_CHANGE_EVENT, handler);

  return () => {
    window.removeEventListener(MOCK_AUTH_CHANGE_EVENT, handler);
  };
}
