// @vitest-environment jsdom
process.env.TZ = "Asia/Tokyo";

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AccountMonthlySummary, MonthlyTransactionSummary } from "@/types";
import Dashboard from "./dashboard";

const getMonthlySummaryMock = vi.fn();
const getAccountsSummaryMock = vi.fn();

vi.mock("./actions", () => ({
  getMonthlySummary: (month: number, year: number) =>
    getMonthlySummaryMock(month, year),
  getAccountsSummary: (month: number, year: number) =>
    getAccountsSummaryMock(month, year),
}));

vi.mock("@/utils/useAuthUser", () => ({
  useAuthUser: () => ({
    user: { user_metadata: { username: "colin" } },
    loading: false,
  }),
}));

vi.mock("../loading", () => ({ default: () => <div>loading</div> }));

vi.mock("@/components/MonthlyStatsSection", () => ({
  default: ({ summary }: { summary: MonthlyTransactionSummary }) => (
    <div data-testid="income">{summary.totalIncome}</div>
  ),
}));

vi.mock("@/components/AccountsOverviewSection", () => ({
  default: ({ accounts }: { accounts: AccountMonthlySummary[] }) => (
    <div data-testid="accounts">{accounts.map((a) => a.name).join(",")}</div>
  ),
}));

vi.mock("@/components/MonthlyFlowCard", () => ({ default: () => null }));
vi.mock("@/components/CategoryBreakdownCard", () => ({ default: () => null }));
vi.mock("@/components/RecentActivityCard", () => ({ default: () => null }));

function summary(totalIncome: number): MonthlyTransactionSummary {
  return {
    totalIncome,
    totalSpending: 0,
    net: totalIncome,
    transactionCount: 0,
    categoryTotals: [],
  };
}

function account(name: string): AccountMonthlySummary {
  return {
    id: name,
    name,
    type: "single",
    currency: "JPY",
    entryCount: 0,
    balance: 0,
    income: 0,
    spending: 0,
    savedPercentage: 0,
    spentPercentage: 0,
  };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

function renderDashboard() {
  return render(
    <Dashboard
      monthlyTransactionSummary={summary(1)}
      twelveMonthFlow={[]}
      accountsSummary={[account("initial")]}
      recentActivity={[]}
    />,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("selects the current UTC month, matching the server-fetched data", () => {
    vi.setSystemTime(new Date("2026-09-30T20:00:00Z"));

    renderDashboard();

    expect(screen.getByText(/SEPTEMBER 2026/)).toBeTruthy();
    expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe(
      "2026-9",
    );
  });

  it("ignores a stale response that resolves after a newer selection", async () => {
    vi.setSystemTime(new Date("2026-09-15T00:00:00Z"));

    const august = deferred<MonthlyTransactionSummary>();
    const augustAccounts = deferred<AccountMonthlySummary[]>();
    const july = deferred<MonthlyTransactionSummary>();
    const julyAccounts = deferred<AccountMonthlySummary[]>();

    getMonthlySummaryMock.mockImplementation((month: number) =>
      month === 8 ? august.promise : july.promise,
    );
    getAccountsSummaryMock.mockImplementation((month: number) =>
      month === 8 ? augustAccounts.promise : julyAccounts.promise,
    );

    renderDashboard();
    const select = screen.getByRole("combobox");

    fireEvent.change(select, { target: { value: "2026-8" } });
    fireEvent.change(select, { target: { value: "2026-7" } });

    await act(async () => {
      july.resolve(summary(700));
      julyAccounts.resolve([account("july")]);
    });

    expect(screen.getByTestId("income").textContent).toBe("700");
    expect(screen.getByTestId("accounts").textContent).toBe("july");

    await act(async () => {
      august.resolve(summary(800));
      augustAccounts.resolve([account("august")]);
    });

    expect(screen.getByTestId("income").textContent).toBe("700");
    expect(screen.getByTestId("accounts").textContent).toBe("july");
  });
});
