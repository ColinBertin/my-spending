import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: ReactNode;
    "aria-current"?: "page";
  }) => (
    <a href={href} aria-current={props["aria-current"]}>
      {children}
    </a>
  ),
}));

vi.mock("next/font/google", () => ({
  Instrument_Sans: () => ({ className: "instrument-sans" }),
}));

let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => mockPathname,
}));

vi.mock("@/utils/authClient", () => ({
  signOut: vi.fn(),
}));

vi.mock("@headlessui/react", () => ({
  Transition: ({ show, children }: { show: boolean; children: ReactNode }) =>
    show ? <>{children}</> : null,
}));

function activeHrefs(html: string) {
  return [...html.matchAll(/<a href="([^"]+)" aria-current="page"/g)].map(
    (match) => match[1],
  );
}

describe("Navbar", () => {
  afterEach(() => {
    mockPathname = "/";
  });

  it.each([
    ["/", "/"],
    ["/accounts", "/accounts"],
    ["/accounts/abc-123", "/accounts"],
    ["/accounts/abc-123/details", "/accounts"],
    ["/categories/create", "/categories"],
  ])("highlights only the matching section on %s", (pathname, expected) => {
    mockPathname = pathname;
    const html = renderToStaticMarkup(<Navbar />);

    // Desktop sidebar only; the mobile drawer is hidden by default
    expect(activeHrefs(html)).toEqual([expected]);
  });

  it("renders logo and keeps the mobile drawer hidden by default", () => {
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain("My Finances");
    expect(html.match(/Log out/g)).toHaveLength(1);
  });
});
