import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Label from "./Label";

function getClassList(html: string) {
  const match = html.match(/class="([^"]*)"/);
  return match ? match[1].split(" ") : [];
}

describe("Label", () => {
  it("renders a native label with children and htmlFor as for", () => {
    const html = renderToStaticMarkup(
      <Label htmlFor="category-name">Name</Label>,
    );

    expect(html).toMatch(/^<label[^>]*>Name<\/label>$/);
    expect(html).toContain('for="category-name"');
  });

  it("applies the base classes", () => {
    const classes = getClassList(renderToStaticMarkup(<Label>Name</Label>));

    expect(classes).toEqual(
      expect.arrayContaining([
        "mb-3",
        "block",
        "text-xs",
        "leading-none",
        "font-medium",
        "text-ink-subtle",
      ]),
    );
  });

  it("merges className and lets callers override base classes", () => {
    const overridden = getClassList(
      renderToStaticMarkup(<Label className="mb-1">Name</Label>),
    );
    expect(overridden).toContain("mb-1");
    expect(overridden).not.toContain("mb-3");

    const appended = getClassList(
      renderToStaticMarkup(<Label className="mt-8">Name</Label>),
    );
    expect(appended).toContain("mt-8");
    expect(appended).toContain("mb-3");
  });

  it("sets data-slot to label", () => {
    const html = renderToStaticMarkup(<Label>Name</Label>);

    expect(html).toContain('data-slot="label"');
  });
});
