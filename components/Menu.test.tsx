import { Children, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Menu from "./Menu";

const pushMock = vi.fn();
const pathnameMock = vi.fn();
const signOutMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => pathnameMock(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("../utils/authClient", () => ({
  signOut: (...args: unknown[]) => signOutMock(...args),
}));

describe("Menu", () => {
  beforeEach(() => {
    pathnameMock.mockReturnValue("/accounts/create");
    signOutMock.mockResolvedValue(undefined);
  });

  it("renders sections and active class", () => {
    const html = renderToStaticMarkup(<Menu />);

    expect(html).toContain("Dashboard");
    expect(html).toContain("New Account");
    expect(html).toContain("New Category");
    expect(html).toContain("Logout");
    expect(html).toContain("text-orange-light");
  });

  it("calls signOut and redirects on logout", async () => {
    const onItemClick = vi.fn();
    const element = Menu({ onItemClick });
    const children = Children.toArray(
      (element as { props: { children: ReactNode } }).props.children,
    );
    const logoutButton = children[1] as {
      props: { onClick: () => Promise<void> };
    };

    await logoutButton.props.onClick();

    expect(signOutMock).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(onItemClick).toHaveBeenCalledTimes(1);
  });
});
