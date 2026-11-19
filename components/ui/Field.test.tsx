import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FieldError, FieldLegend } from "./Field";

function getClassList(html: string) {
  const match = html.match(/class="([^"]*)"/);
  return match ? match[1].split(" ") : [];
}

describe("FieldLegend", () => {
  it("renders a native legend with the label styling", () => {
    const html = renderToStaticMarkup(<FieldLegend>Colour</FieldLegend>);

    expect(html).toMatch(/^<legend[^>]*>Colour<\/legend>$/);
    expect(html).toContain('data-slot="field-legend"');
    expect(getClassList(html)).toEqual(
      expect.arrayContaining(["mb-3", "text-xs", "text-ink-subtle"]),
    );
  });

  it("lets callers override classes", () => {
    const classes = getClassList(
      renderToStaticMarkup(<FieldLegend className="sr-only">Type</FieldLegend>),
    );

    expect(classes).toContain("sr-only");
  });
});

describe("FieldError", () => {
  it("renders nothing without a message", () => {
    expect(renderToStaticMarkup(<FieldError />)).toBe("");
    expect(renderToStaticMarkup(<FieldError message="" />)).toBe("");
  });

  it("renders the message as an alert", () => {
    const html = renderToStaticMarkup(<FieldError message="Pick an icon" />);

    expect(html).toContain('role="alert"');
    expect(html).toContain('data-slot="field-error"');
    expect(html).toContain("Pick an icon");
  });

  it("lets callers override the spacing", () => {
    const classes = getClassList(
      renderToStaticMarkup(<FieldError message="x" className="mt-1" />),
    );

    expect(classes).toContain("mt-1");
    expect(classes).not.toContain("mt-2");
  });
});
