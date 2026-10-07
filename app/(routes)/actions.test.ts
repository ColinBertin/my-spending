import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccountsSummary, getMonthlySummary } from "./actions";

const fromMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

vi.mock("@/utils/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  }),
}));

function chain(result: { data: unknown; error: unknown }) {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "in", "gte", "lt"]) {
    builder[method] = vi.fn(() => builder);
  }
  builder.then = (resolve: (value: unknown) => unknown) => resolve(result);
  return builder;
}

const actions = [
  ["getMonthlySummary", getMonthlySummary],
  ["getAccountsSummary", getAccountsSummary],
] as const;

describe.each(actions)("%s input validation", (_name, action) => {
  beforeEach(() => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    fromMock.mockImplementation((table: string) =>
      chain({
        data:
          table === "account_members"
            ? [
                {
                  account_id: "account-1",
                  account: {
                    id: "account-1",
                    name: "Wallet",
                    type: "single",
                    currency: "JPY",
                  },
                },
              ]
            : [],
        error: null,
      }),
    );
  });

  it.each([
    [Number.NaN, 2026],
    [0, 2026],
    [13, 2026],
    [1.5, 2026],
    ["3" as unknown as number, 2026],
  ])("rejects invalid month %s", async (month, year) => {
    await expect(action(month, year)).rejects.toThrow(
      "month must be an integer between 1 and 12",
    );
    expect(fromMock).not.toHaveBeenCalled();
  });

  it.each([
    [3, Number.NaN],
    [3, 1969],
    [3, 10000],
    [3, 2026.5],
  ])("rejects invalid year %s/%s", async (month, year) => {
    await expect(action(month, year)).rejects.toThrow(
      "year must be a valid 4-digit year",
    );
    expect(fromMock).not.toHaveBeenCalled();
  });

  it("accepts a valid month and year", async () => {
    await expect(action(3, 2026)).resolves.toBeDefined();
  });
});
