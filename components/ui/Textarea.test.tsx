import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Textarea from "./Textarea";

function textareaTag(html: string) {
  return html.match(/<textarea[^>]*>/)?.[0] ?? "";
}

describe("Textarea", () => {
  it("renders a native textarea with 3 rows by default", () => {
    const tag = textareaTag(renderToStaticMarkup(<Textarea id="note" />));

    expect(tag).toContain('rows="3"');
    expect(tag).toContain('data-slot="textarea"');
    expect(tag).toContain('id="note"');
  });

  it("renders a label only when a title is given", () => {
    expect(renderToStaticMarkup(<Textarea id="note" title="Note" />)).toContain(
      '<label data-slot="label"',
    );
    expect(renderToStaticMarkup(<Textarea id="note" />)).not.toContain(
      "<label",
    );
  });

  it("does not forward the title to the textarea", () => {
    const tag = textareaTag(
      renderToStaticMarkup(<Textarea id="note" title="Note" />),
    );

    expect(tag).not.toContain("title=");
  });

  it("adds a muted 'optional' tag when optional", () => {
    const html = renderToStaticMarkup(
      <Textarea id="note" title="Note" optional />,
    );

    expect(html).toContain(">optional</span>");
    expect(
      renderToStaticMarkup(<Textarea id="note" title="Note" />),
    ).not.toContain("optional");
  });

  it("drives error styling from aria-invalid and shows the message", () => {
    const html = renderToStaticMarkup(
      <Textarea id="note" aria-invalid errorMessage="Too long" />,
    );

    expect(textareaTag(html)).toContain("aria-invalid:border-negative");
    expect(textareaTag(html)).toContain('aria-invalid="true"');
    expect(html).toContain('role="alert"');
    expect(html).toContain("Too long");
  });

  it("links the hint with aria-describedby", () => {
    const html = renderToStaticMarkup(
      <Textarea id="note" subText="Shown on the ledger" />,
    );

    expect(html).toContain('<p id="note-hint"');
    expect(textareaTag(html)).toContain('aria-describedby="note-hint"');
  });

  it("puts containerClassName on the wrapper and className on the textarea", () => {
    const html = renderToStaticMarkup(
      <Textarea id="note" containerClassName="mt-4.5" className="min-h-24" />,
    );

    expect(html.startsWith('<div class="mt-4.5">')).toBe(true);
    expect(textareaTag(html)).toContain("min-h-24");
    expect(textareaTag(html)).not.toContain("min-h-16.5");
  });
});
