import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CategoryTile, { getCategoryIcon } from "./category-tile";

describe("getCategoryIcon", () => {
  it("resolves icons from the supported packs", () => {
    expect(getCategoryIcon("hi", "HiShoppingBag")).toBeTypeOf("function");
    expect(getCategoryIcon("xx", "HiShoppingBag")).toBeUndefined();
    expect(getCategoryIcon("hi", undefined)).toBeUndefined();
  });
});

describe("CategoryTile", () => {
  it("tints the tile with the category colour and renders the icon", () => {
    const html = renderToStaticMarkup(
      <CategoryTile
        hex="#FFFFFF"
        icon="HiShoppingBag"
        iconPack="hi"
        name="Groceries"
      />,
    );

    expect(html).toContain("background-color:#FFFFFF1F");
    expect(html).toContain("color:#b8b8b8");
    expect(html).toContain("<svg");
  });

  it("falls back to the name initial without a valid icon", () => {
    const html = renderToStaticMarkup(
      <CategoryTile hex="#5C5952" name="rent" size="lg" />,
    );

    expect(html).not.toContain("<svg");
    expect(html).toContain(">R</span>");
    expect(html).toContain("h-9 w-9");
  });
});
