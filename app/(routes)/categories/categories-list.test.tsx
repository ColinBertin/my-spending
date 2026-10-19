import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CategoriesList from "./categories-list";
import type { CategoryCard } from "./category-cards";

function card(overrides: Partial<CategoryCard>): CategoryCard {
  return {
    id: "cat",
    name: "Food",
    scope: "normal",
    hex: "#FEE2E2",
    icon: "HiShoppingBag",
    iconPack: "hi",
    entries: 2,
    usageLabel: "MAIN · 2 ENTRIES",
    total: "¥1,500",
    barPercent: 100,
    ...overrides,
  };
}

describe("CategoriesList", () => {
  it("renders the header, meta and normal-scope cards by default", () => {
    const html = renderToStaticMarkup(
      <CategoriesList
        meta="2 categories · used across 1 account"
        cards={[
          card({ id: "food" }),
          card({ id: "util", name: "水道光熱費", scope: "professional" }),
        ]}
      />,
    );

    expect(html).toContain("Categories");
    expect(html).toContain("2 categories · used across 1 account");
    expect(html).toContain("New category");
    expect(html).toContain("Add category");
    expect(html).toContain('href="/categories/create"');
    expect(html).toContain("Food");
    expect(html).toContain("MAIN · 2 ENTRIES");
    expect(html).toContain("¥1,500");
    expect(html).toContain("width:100.0%");
    expect(html).not.toContain("水道光熱費");
    expect(html).toMatch(/aria-pressed="true"[^>]*>Normal</);
  });

  it("shows an empty state when the scope has no categories", () => {
    const html = renderToStaticMarkup(
      <CategoriesList
        meta="0 categories · used across 0 accounts"
        cards={[]}
      />,
    );

    expect(html).toContain("No normal categories yet");
    expect(html).toContain("Add category");
  });
});
