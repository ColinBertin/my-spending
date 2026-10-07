import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("New category loading skeleton", () => {
  it("mirrors the form layout instead of a spinner", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain('aria-label="Loading new category form"');
    expect(html).toContain("New category");
    expect(html).toContain("mt-10 flex flex-col gap-3");
  });
});
