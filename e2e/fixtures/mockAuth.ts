import type { Page, Route } from "@playwright/test";

const mockUser = {
  id: "11111111-1111-1111-1111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "demo@example.com",
  email_confirmed_at: "2026-01-01T00:00:00.000Z",
  created_at: "2026-01-01T00:00:00.000Z",
  app_metadata: {
    provider: "email",
    providers: ["email"],
  },
  user_metadata: {
    username: "Demo User",
  },
};

export type CapturedSignupPayload = {
  email: string;
  password: string;
  data?: {
    username?: string;
  };
  options?: {
    data?: {
      username?: string;
    };
  };
};

function jsonHeaders() {
  return {
    "content-type": "application/json",
    apikey: "mock-anon-key",
  };
}

export async function mockSignupSuccess(
  page: Page,
  onRequest?: (payload: CapturedSignupPayload) => void,
) {
  await page.route("**/auth/v1/signup*", async (route: Route) => {
    const payload = route.request().postDataJSON() as CapturedSignupPayload;
    onRequest?.(payload);

    await route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify({
        user: {
          ...mockUser,
          email: payload.email,
          user_metadata: {
            username:
              payload.data?.username ??
              payload.options?.data?.username ??
              "Demo User",
          },
        },
        session: null,
      }),
    });
  });
}

export async function mockLoginFailure(
  page: Page,
  message = "Invalid login credentials",
) {
  await page.route("**/auth/v1/token?grant_type=password", async (route) => {
    await route.fulfill({
      status: 400,
      headers: jsonHeaders(),
      body: JSON.stringify({
        error: "invalid_grant",
        error_description: message,
      }),
    });
  });
}
