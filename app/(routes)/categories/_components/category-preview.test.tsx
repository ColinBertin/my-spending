import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CategoryPreview, { PREVIEW_PLACEHOLDER } from "./category-preview";

describe("CategoryPreview", () => {
  it("shows the name and its uppercase row label", () => {
    const html = renderToStaticMarkup(
      <CategoryPreview name="Groceries" hex="#FEE2E2" />,
    );

    expect(html).toContain("Groceries");
    expect(html).toContain("GROCERIES");
    expect(html).not.toContain(PREVIEW_PLACEHOLDER);
  });

  it("falls back to a muted placeholder when the name is empty", () => {
    const html = renderToStaticMarkup(<CategoryPreview hex="#FEE2E2" />);

    expect(html).toContain(PREVIEW_PLACEHOLDER);
    expect(html).toContain(PREVIEW_PLACEHOLDER.toUpperCase());
    expect(html).toContain("text-ink-subtle");
  });

  it("treats a whitespace-only name as empty", () => {
    const html = renderToStaticMarkup(
      <CategoryPreview name="   " hex="#FEE2E2" />,
    );

    expect(html).toContain(PREVIEW_PLACEHOLDER);
    expect(html).toContain("text-ink-subtle");
  });

  it("trims the name it displays", () => {
    const html = renderToStaticMarkup(
      <CategoryPreview name="  Rent  " hex="#FEE2E2" />,
    );

    expect(html).toContain(">Rent<");
    expect(html).toContain(">RENT<");
  });

  it("does not mute a real name", () => {
    const html = renderToStaticMarkup(
      <CategoryPreview name="Rent" hex="#FEE2E2" />,
    );

    expect(html).not.toContain("text-ink-subtle");
  });

  it("always shows the preview caption", () => {
    const html = renderToStaticMarkup(<CategoryPreview hex="#FEE2E2" />);

    expect(html).toContain("PREVIEW · AS IT WILL APPEAR IN ROWS");
  });
});
