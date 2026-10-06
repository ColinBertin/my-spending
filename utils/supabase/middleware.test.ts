import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { updateSession } from "./middleware";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, unknown>;
};
type CookieOptions = { setAll: (cookies: CookieToSet[]) => void };

const getClaimsMock = vi.fn();
let cookieOptions: CookieOptions;

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: { cookies: CookieOptions },
  ) => {
    cookieOptions = options.cookies;
    return { auth: { getClaims: getClaimsMock } };
  },
}));

function clearSessionDuringGetClaims() {
  getClaimsMock.mockImplementation(async () => {
    cookieOptions.setAll([
      { name: "sb-auth-token", value: "", options: { path: "/", maxAge: 0 } },
    ]);
    return { data: null };
  });
}

function request(path: string) {
  return new NextRequest(new URL(path, "http://localhost:3000"));
}

describe("updateSession", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_USE_MOCK", "false");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://supabase.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("without a session", () => {
    beforeEach(() => {
      getClaimsMock.mockResolvedValue({ data: null });
    });

    it("returns a 401 JSON response for API routes", async () => {
      const response = await updateSession(request("/api/transactions"));

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: "Unauthorized",
      });
    });

    it("redirects page requests to /login", async () => {
      const response = await updateSession(request("/accounts"));

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost:3000/login",
      );
    });

    it.each(["/api/transactions", "/accounts"])(
      "forwards cleared session cookies on %s",
      async (path) => {
        clearSessionDuringGetClaims();

        const response = await updateSession(request(path));

        const cookie = response.cookies.get("sb-auth-token");
        expect(cookie?.value).toBe("");
        expect(cookie?.maxAge).toBe(0);
        expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
      },
    );

    it("lets the login and signup pages through", async () => {
      for (const path of ["/login", "/signup"]) {
        const response = await updateSession(request(path));
        expect(response.headers.get("location")).toBeNull();
        expect(response.status).toBe(200);
      }
    });
  });

  it("lets authenticated API requests through", async () => {
    getClaimsMock.mockResolvedValue({ data: { claims: { sub: "user-1" } } });

    const response = await updateSession(request("/api/transactions"));

    expect(response.status).toBe(200);
  });
});
