import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Loading from "./loading";

describe("Update category loading page", () => {
  it("renders the form skeleton in update mode", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain("Update category");
    expect(html).toContain('aria-label="Loading update category form"');
  });
});
