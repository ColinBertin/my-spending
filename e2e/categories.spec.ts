import { expect, test } from "@playwright/test";

import {
  mockCreateCategoryFailure,
  mockCreateCategorySuccess,
} from "./fixtures/mockCategories";

test.describe("Category route", () => {
  test("shows validation errors when required fields are missing", async ({
    page,
  }) => {
    await page.goto("/categories/create");

    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Name is required")).toBeVisible();
    await expect(page.getByText("Icon is required")).toBeVisible();
  });

  test("submits expected payload on successful category creation", async ({
    page,
  }) => {
    let capturedPayload: Record<string, unknown> | null = null;

    await mockCreateCategorySuccess(page, (payload) => {
      capturedPayload = payload as unknown as Record<string, unknown>;
    });

    await page.goto("/categories/create");

    await page.getByPlaceholder("Name").fill("Groceries");
    await page.getByRole("combobox").selectOption("professional");
    await page.getByLabel("Select coral").click();
    await page.locator("div.grid button").first().click();

    await page.getByRole("button", { name: "Add" }).click();

    await expect
      .poll(() => capturedPayload)
      .toMatchObject({
        name: "Groceries",
        type: "professional",
        color: "coral",
      });

    await expect
      .poll(() => Boolean(capturedPayload?.icon && capturedPayload?.icon_pack))
      .toBe(true);
  });

  test("shows error notification when category API returns an error", async ({
    page,
  }) => {
    await mockCreateCategoryFailure(page, "Name already exists");

    await page.goto("/categories/create");

    await page.getByPlaceholder("Name").fill("Duplicate");
    await page.getByLabel("Select rose").click();
    await page.locator("div.grid button").first().click();
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Something bad happened!")).toBeVisible();
    await expect(page.getByText("Failed to create account")).toBeVisible();
    await expect(page).toHaveURL(/\/categories\/create$/);
  });
});
