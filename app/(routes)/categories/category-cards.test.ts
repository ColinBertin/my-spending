import { describe, expect, it } from "vitest";
import type { Category } from "@/types";
import {
  buildCategoriesOverview,
  CategoryUsageRow,
  darkenHex,
  FALLBACK_CATEGORY_HEX,
  formatCurrencyAmount,
  resolveCategoryHex,
} from "./category-cards";

function row(overrides: Partial<CategoryUsageRow>): CategoryUsageRow {
  return {
    account_id: "acc-1",
    category_id: null,
    category_name: "Food",
    amount: 1000,
    currency: "jpy",
    ...overrides,
  };
}

const categories: Category[] = [
  { id: "cat-food", name: "Food", type: "normal", color: "rose" },
  { id: "cat-util", name: "水道光熱費", type: "professional", color: "mint" },
  { id: "cat-legacy", name: "Gifts" },
];

const accountNames = new Map([
  ["acc-1", "Main"],
  ["acc-2", "Business"],
]);

describe("resolveCategoryHex", () => {
  it("maps colour codes to hex and falls back for unknown values", () => {
    expect(resolveCategoryHex("rose")).toBe("#FEE2E2");
    expect(resolveCategoryHex("not-a-colour")).toBe(FALLBACK_CATEGORY_HEX);
    expect(resolveCategoryHex(undefined)).toBe(FALLBACK_CATEGORY_HEX);
  });
});

describe("darkenHex", () => {
  it("scales each channel by the design factor", () => {
    expect(darkenHex("#FFFFFF")).toBe("#b8b8b8");
    expect(darkenHex("#000000")).toBe("#000000");
  });

  it("returns non six-digit values untouched", () => {
    expect(darkenHex("red")).toBe("red");
  });
});

describe("formatCurrencyAmount", () => {
  it("formats per currency, case-insensitively", () => {
    expect(formatCurrencyAmount(8420, "jpy")).toBe("¥8,420");
    expect(formatCurrencyAmount(12.5, "EUR")).toBe("€12.50");
  });

  it("falls back for invalid currency codes", () => {
    expect(formatCurrencyAmount(5, "nope")).toBe("5 NOPE");
  });
});

describe("buildCategoriesOverview", () => {
  it("folds usage by id first, then by name snapshot", () => {
    const { cards, meta } = buildCategoriesOverview(
      categories,
      [
        row({ amount: 1000 }),
        row({ amount: "500", account_id: "acc-2" }),
        row({
          category_id: "cat-util",
          category_name: "Old utilities name",
          amount: 6732,
          account_id: "acc-2",
        }),
        row({ category_name: "Unknown" }),
      ],
      accountNames,
    );

    const food = cards.find((card) => card.id === "cat-food")!;
    expect(food.entries).toBe(2);
    expect(food.usageLabel).toBe("2 ACCOUNTS · 2 ENTRIES");
    expect(food.total).toBe("¥1,500");
    expect(food.barPercent).toBe(100);
    expect(food.hex).toBe("#FEE2E2");

    const utilities = cards.find((card) => card.id === "cat-util")!;
    expect(utilities.scope).toBe("professional");
    expect(utilities.usageLabel).toBe("BUSINESS · 1 ENTRY");
    expect(utilities.total).toBe("¥6,732");
    expect(utilities.barPercent).toBe(50);

    expect(meta).toBe("3 categories · used across 2 accounts");
  });

  it("treats categories without a type as normal and marks unused ones", () => {
    const { cards, meta } = buildCategoriesOverview(
      categories,
      [],
      accountNames,
    );

    const legacy = cards.find((card) => card.id === "cat-legacy")!;
    expect(legacy.scope).toBe("normal");
    expect(legacy.usageLabel).toBe("NO ENTRIES YET");
    expect(legacy.total).toBe("—");
    expect(legacy.barPercent).toBe(0);
    expect(meta).toBe("3 categories · used across 0 accounts");
  });

  it("keeps totals per currency instead of summing across them", () => {
    const { cards } = buildCategoriesOverview(
      [categories[0]],
      [row({ amount: 1000 }), row({ amount: 20, currency: "eur" })],
      accountNames,
    );

    expect(cards[0].total).toBe("¥1,000 · €20.00");
    expect(cards[0].usageLabel).toBe("MAIN · 2 ENTRIES");
  });

  it("uses singular wording for one category and one account", () => {
    const { meta } = buildCategoriesOverview(
      [categories[0]],
      [row({})],
      accountNames,
    );

    expect(meta).toBe("1 category · used across 1 account");
  });
});
