import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Layout, { metadata } from "./layout";

vi.mock("../../components/layout/Navbar", () => ({
  default: () => <div>Mock Navbar</div>,
}));

vi.mock("../../components/ui/NotificationProvider", () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

describe("routes layout", () => {
  it("renders navbar and page content", () => {
    const html = renderToStaticMarkup(
      <Layout>
        <p>Page Content</p>
      </Layout>,
    );

    expect(html).toContain("Mock Navbar");
    expect(html).toContain("Page Content");
  });

  it("exports metadata defaults", () => {
    expect(metadata.title).toEqual({
      template: "%s - My Spending",
      default: "My Spending",
    });
  });
});
