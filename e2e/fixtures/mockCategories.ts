import type { Page, Route } from "@playwright/test";

export type CapturedCategoryPayload = {
  name: string;
  type?: "normal" | "professional";
  color?: string;
  icon?: string;
  icon_pack?: string;
};

function jsonHeaders() {
  return {
    "content-type": "application/json",
  };
}

export async function mockCreateCategorySuccess(
  page: Page,
  onRequest?: (payload: CapturedCategoryPayload) => void,
) {
  await page.route("**/api/categories", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    const payload = route.request().postDataJSON() as CapturedCategoryPayload;

    onRequest?.(payload);

    await route.fulfill({
      status: 201,
      headers: jsonHeaders(),
      body: JSON.stringify({
        id: "44444444-4444-4444-4444-444444444444",
      }),
    });
  });
}

export async function mockCreateCategoryFailure(
  page: Page,
  message = "Failed to create category",
) {
  await page.route("**/api/categories", async (route: Route) => {
    if (route.request().method() !== "POST") {
      await route.fallback();
      return;
    }

    await route.fulfill({
      status: 400,
      headers: jsonHeaders(),
      body: JSON.stringify({
        error: message,
      }),
    });
  });
}
