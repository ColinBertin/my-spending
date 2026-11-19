import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("New category loading page", () => {
  it("renders the form skeleton in create mode", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain("New category");
    expect(html).toContain('aria-label="Loading new category form"');
  });
});
