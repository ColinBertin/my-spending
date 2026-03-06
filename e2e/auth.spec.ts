import { expect, test } from "@playwright/test";

import { mockLoginFailure, mockSignupSuccess } from "./fixtures/mockAuth";

test.describe("Auth flows with mock data", () => {
  test("signup submits expected payload using mocked Supabase response", async ({
    page,
  }) => {
    let capturedEmail = "";
    let capturedUsername = "";

    await mockSignupSuccess(page, (payload) => {
      capturedEmail = payload.email;
      capturedUsername =
        payload.data?.username ?? payload.options?.data?.username ?? "";
    });

    await page.goto("/signup");

    await page.getByPlaceholder("Username").fill("E2E Tester");
    await page.getByPlaceholder("Email").fill("e2e@example.com");
    await page
      .getByPlaceholder("Password", { exact: true })
      .fill("strong-password");
    await page.getByPlaceholder("Confirm Password").fill("strong-password");

    await page.getByRole("button", { name: "Sign up" }).click();

    await expect
      .poll(() => ({ capturedEmail, capturedUsername }))
      .toEqual({
        capturedEmail: "e2e@example.com",
        capturedUsername: "E2E Tester",
      });

    await expect(page).toHaveURL(/\/login$/);
  });

  test("login shows API error from mocked Supabase response", async ({
    page,
  }) => {
    await mockLoginFailure(page, "Invalid login credentials");

    await page.goto("/login");

    await page.getByPlaceholder("Email").fill("wrong@example.com");
    await page.getByPlaceholder("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText("Something bad happened!")).toBeVisible();
    await expect(page.getByText("Invalid login credentials")).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
