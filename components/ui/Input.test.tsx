import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Input from "./Input";

function getInputTag(html: string) {
  const match = html.match(/<input[^>]*\/>/);
  return match ? match[0] : "";
}

function getClassList(tag: string) {
  const match = tag.match(/class="([^"]*)"/);
  return match ? match[1].split(" ") : [];
}

function getInputClassList(html: string) {
  return getClassList(getInputTag(html));
}

describe("Input", () => {
  it("renders a native text input by default", () => {
    const input = getInputTag(
      renderToStaticMarkup(<Input id="category-name" />),
    );

    expect(input).toContain('type="text"');
    expect(input).toContain('id="category-name"');
    expect(input).toContain('data-slot="input"');
  });

  it("passes the type and other props through", () => {
    const input = getInputTag(
      renderToStaticMarkup(
        <Input type="email" name="email" placeholder="you@example.com" />,
      ),
    );

    expect(input).toContain('type="email"');
    expect(input).toContain('name="email"');
    expect(input).toContain('placeholder="you@example.com"');
  });

  it("renders a label for the input when a title is given", () => {
    const html = renderToStaticMarkup(<Input id="account-name" title="Name" />);

    expect(html).toMatch(/<label[^>]*for="account-name"[^>]*>Name<\/label>/);
  });

  it("does not render a label without a title", () => {
    const html = renderToStaticMarkup(<Input id="account-name" />);

    expect(html).not.toContain("<label");
  });

  it("does not forward the title as an attribute on the input", () => {
    const input = getInputTag(
      renderToStaticMarkup(<Input id="account-name" title="Name" />),
    );

    expect(input).not.toContain("title=");
  });

  it("styles the error state from aria-invalid, not from props", () => {
    const classes = getInputClassList(renderToStaticMarkup(<Input />));

    expect(classes).toEqual(
      expect.arrayContaining([
        "border-hairline",
        "aria-invalid:border-negative",
        "focus:not-aria-invalid:border-ink",
      ]),
    );
  });

  it("forwards aria-invalid", () => {
    const input = getInputTag(renderToStaticMarkup(<Input aria-invalid />));

    expect(input).toContain('aria-invalid="true"');
  });

  it("lets callers override input classes", () => {
    const classes = getInputClassList(
      renderToStaticMarkup(<Input className="h-9" />),
    );

    expect(classes).toContain("h-9");
    expect(classes).not.toContain("h-11");
  });

  it("applies containerClassName to the wrapper, not the input", () => {
    const html = renderToStaticMarkup(
      <Input title="Name" containerClassName="mt-8" />,
    );

    expect(html).toMatch(/^<div class="mt-8">/);
    expect(getInputClassList(html)).not.toContain("mt-8");
    expect(html).not.toMatch(/<label[^>]*class="[^"]*mt-8/);
  });

  it("renders subText as a hint linked through aria-describedby", () => {
    const html = renderToStaticMarkup(
      <Input id="category-name" subText="Can't be renamed." />,
    );

    expect(html).toContain('<p id="category-name-hint"');
    expect(html).toContain("Can&#x27;t be renamed.");
    expect(getInputTag(html)).toContain(
      'aria-describedby="category-name-hint"',
    );
  });

  it("merges the hint id with a caller-provided aria-describedby", () => {
    const input = getInputTag(
      renderToStaticMarkup(
        <Input id="category-name" aria-describedby="other" subText="Hint" />,
      ),
    );

    expect(input).toContain('aria-describedby="other category-name-hint"');
  });

  it("keeps a caller aria-describedby when there is no subText", () => {
    const input = getInputTag(
      renderToStaticMarkup(<Input id="category-name" aria-describedby="x" />),
    );

    expect(input).toContain('aria-describedby="x"');
  });

  it("does not set aria-describedby without subText or a caller value", () => {
    const input = getInputTag(renderToStaticMarkup(<Input id="name" />));

    expect(input).not.toContain("aria-describedby");
  });

  it("renders the error message as an alert", () => {
    const html = renderToStaticMarkup(
      <Input id="account-name" errorMessage="Name is required" />,
    );

    expect(html).toMatch(/role="alert"/);
    expect(html).toContain("Name is required");
  });

  it("renders no alert without an error message", () => {
    const html = renderToStaticMarkup(<Input id="account-name" />);

    expect(html).not.toContain('role="alert"');
  });
});
