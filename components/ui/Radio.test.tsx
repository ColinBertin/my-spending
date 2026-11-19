import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Radio from "./Radio";

describe("Radio", () => {
  it("renders a visually hidden native radio", () => {
    const html = renderToStaticMarkup(<Radio value="normal" />);

    expect(html).toMatch(/^<input[^>]*\/>$/);
    expect(html).toContain('type="radio"');
    expect(html).toContain('class="sr-only"');
    expect(html).toContain('data-slot="radio"');
    expect(html).toContain('value="normal"');
  });

  it("passes name, checked and aria props through", () => {
    const html = renderToStaticMarkup(
      <Radio name="icon" value="HiSun" aria-label="HiSun" checked readOnly />,
    );

    expect(html).toContain('name="icon"');
    expect(html).toContain('aria-label="HiSun"');
    expect(html).toContain('checked=""');
  });

  it("merges extra classes with sr-only", () => {
    const html = renderToStaticMarkup(<Radio className="peer" />);

    expect(html).toContain('class="sr-only peer"');
  });
});
