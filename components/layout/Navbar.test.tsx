import { renderToStaticMarkup } from "react-dom/server";
import Navbar from "./Navbar";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt?: string }) => <img alt={alt ?? ""} />,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("../Menu", () => ({
  default: () => <div>Mock Menu</div>,
}));

vi.mock("@headlessui/react", () => ({
  Transition: ({
    show,
    children,
  }: {
    show: boolean;
    children: React.ReactNode;
  }) => (show ? <>{children}</> : null),
}));

describe("Navbar", () => {
  it("renders logo and keeps menu hidden by default", () => {
    const html = renderToStaticMarkup(<Navbar />);

    expect(html).toContain("My Finances");
    expect(html).not.toContain("Mock Menu");
  });
});
