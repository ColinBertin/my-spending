import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("next/font/google", () => ({
  Instrument_Sans: () => ({ className: "instrument-sans" }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("@/utils/authClient", () => ({
  signOut: vi.fn(),
}));

vi.mock("@headlessui/react", () => ({
  Transition: ({ show, children }: { show: boolean; children: ReactNode }) =>
    show ? <>{children}</> : null,
}));

describe("Navbar", () => {
  it("renders logo and keeps the mobile drawer hidden by default", () => {
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain("My Finances");
    expect(html.match(/Log out/g)).toHaveLength(1);
  });
});
