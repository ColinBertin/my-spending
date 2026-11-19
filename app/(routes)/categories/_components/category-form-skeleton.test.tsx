import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import CategoryFormSkeleton from "./category-form-skeleton";

function countMatches(html: string, pattern: RegExp) {
  return html.match(pattern)?.length ?? 0;
}

describe("CategoryFormSkeleton", () => {
  it("shows the create title and a matching busy label", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="create" />);

    expect(html).toContain("New category");
    expect(html).not.toContain("Update category");
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Loading new category form"');
  });

  it("shows the update title and a matching busy label", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="update" />);

    expect(html).toContain("Update category");
    expect(html).not.toContain("New category");
    expect(html).toContain('aria-label="Loading update category form"');
  });

  it("uses the same heading styles as the form so the title does not jump", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="create" />);

    expect(html).toContain(
      'class="mt-2 text-2xl leading-tight font-semibold tracking-tight md:mt-0 md:text-3xl"',
    );
  });

  it("renders a placeholder for every form section", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="create" />);

    // card + preview
    expect(html).toContain("rounded-card border border-hairline bg-white");
    expect(html).toContain(
      "rounded-lg border border-hairline bg-surface-field",
    );
    // name input
    expect(html).toContain(
      "h-11 rounded-control border border-hairline bg-surface-field",
    );
    // scope toggle
    expect(html).toContain("w-55");
    // colour + icon pickers, sized like the real swatches and icons
    expect(countMatches(html, /size-9\.5 sm:size-8\.5/g)).toBe(14);
    expect(countMatches(html, /size-11 sm:size-10/g)).toBe(14);
    // actions
    expect(html).toContain("mt-10 flex flex-col gap-3");
    expect(countMatches(html, /h-control-full/g)).toBe(2);
  });

  it("hides the placeholder blocks from screen readers", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="create" />);

    // description bar, preview, name, scope, colour, icon, actions
    expect(countMatches(html, /aria-hidden="true"/g)).toBe(7);
  });

  it("has no hardcoded pixel or hex values", () => {
    const html = renderToStaticMarkup(<CategoryFormSkeleton mode="update" />);

    expect(html).not.toMatch(/-\[\d+(\.\d+)?px\]/);
    expect(html).not.toMatch(/#[0-9A-Fa-f]{6}/);
  });
});
