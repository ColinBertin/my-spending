import { renderToStaticMarkup } from "react-dom/server";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AccountHeader, { AccountSummary } from "./account-header";

let mockId: string | undefined;
let mockPathname = "";

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: mockId }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/MonthStepper", () => ({ default: () => null }));

const accounts: AccountSummary[] = [
  {
    id: "account-1",
    name: "Main wallet",
    type: "single",
    currency: "JPY",
    entryCount: 0,
    balance: 0,
    income: 0,
    spending: 0,
    savedPercentage: 0,
    spentPercentage: 0,
  },
];

describe("AccountHeader", () => {
  beforeEach(() => {
    mockId = undefined;
    mockPathname = "";
  });

  it("renders the account matching the URL id", () => {
    mockId = "account-1";
    mockPathname = "/accounts/account-1/details";

    const html = renderToStaticMarkup(<AccountHeader accounts={accounts} />);

    expect(html).toContain("Main wallet");
    expect(html).toContain('href="/accounts/account-1/transactions/create"');
  });

  it("renders nothing when the URL id is not one of the user's accounts", () => {
    mockId = "someone-elses-account";
    mockPathname = "/accounts/someone-elses-account/details";

    const html = renderToStaticMarkup(<AccountHeader accounts={accounts} />);

    expect(html).toBe("");
  });
});
