import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Input from "./Input";

function getClassList(html: string) {
  const match = html.match(/class="([^"]*)"/);
  return match ? match[1].split(" ") : [];
}

describe("Input", () => {
  it("renders a native text input by default", () => {
    const html = renderToStaticMarkup(<Input id="category-name" />);

    expect(html).toMatch(/^<input[^>]*\/>$/);
    expect(html).toContain('type="text"');
    expect(html).toContain('id="category-name"');
    expect(html).toContain('data-slot="input"');
  });

  it("passes the type and other props through", () => {
    const html = renderToStaticMarkup(
      <Input type="email" name="email" placeholder="you@example.com" />,
    );

    expect(html).toContain('type="email"');
    expect(html).toContain('name="email"');
    expect(html).toContain('placeholder="you@example.com"');
  });

  it("styles the error state from aria-invalid, not from props", () => {
    const classes = getClassList(renderToStaticMarkup(<Input />));

    expect(classes).toEqual(
      expect.arrayContaining([
        "border-hairline",
        "aria-invalid:border-negative",
        "focus:not-aria-invalid:border-ink",
      ]),
    );
  });

  it("forwards aria-invalid", () => {
    const html = renderToStaticMarkup(<Input aria-invalid />);

    expect(html).toContain('aria-invalid="true"');
  });

  it("lets callers override classes", () => {
    const classes = getClassList(
      renderToStaticMarkup(<Input className="h-9" />),
    );

    expect(classes).toContain("h-9");
    expect(classes).not.toContain("h-11");
  });
});
