import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Transaction } from "@/types";
import AccountDetails, { buildCategoryMix } from "./details";

let monthParam: string | null = null;

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({
    get: (key: string) => (key === "month" ? monthParam : null),
  }),
}));

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    id: "tx",
    title: "Entry",
    type: "expense",
    category_name: "Food",
    amount: 0,
    currency: "JPY",
    date: new Date("2026-03-01T03:00:00.000Z"),
    ...overrides,
  };
}

const transactions: Transaction[] = [
  tx({
    id: "tx-1",
    title: "Supermarket",
    note: "Split with Mika",
    amount: 8420,
    date: new Date("2026-03-14T03:00:00.000Z"),
  }),
  tx({
    id: "tx-2",
    title: "Monthly salary",
    type: "income",
    category_name: "Salary",
    amount: 385000,
    date: new Date("2026-03-05T03:00:00.000Z"),
  }),
  tx({
    id: "tx-3",
    title: "Apartment",
    category_name: "Rent",
    amount: 95000,
    date: new Date("2026-03-10T03:00:00.000Z"),
  }),
];

function render(list: Transaction[] = transactions) {
  return renderToStaticMarkup(
    <AccountDetails
      accountId="acc-1"
      transactions={list}
      initialMonth="3"
      initialYear="2026"
    />,
  );
}

describe("buildCategoryMix", () => {
  it("ranks expense categories and ignores income", () => {
    const mix = buildCategoryMix(transactions);

    expect(mix.map((slice) => slice.name)).toEqual(["Rent", "Food"]);
    expect(mix[0].total).toBe(95000);
    expect(mix[0].percentage + mix[1].percentage).toBeCloseTo(100);
    expect(mix[0].color).not.toBe(mix[1].color);
  });

  it("folds the tail into Other once there are more than six categories", () => {
    const many = Array.from({ length: 8 }, (_, i) =>
      tx({ id: `t-${i}`, category_name: `Cat ${i}`, amount: 100 - i }),
    );
    const mix = buildCategoryMix(many);

    expect(mix).toHaveLength(6);
    expect(mix[5]).toMatchObject({ name: "Other", total: 95 + 94 + 93 });
  });

  it("returns nothing when there is no spending", () => {
    expect(buildCategoryMix([tx({ type: "income", amount: 1000 })])).toEqual(
      [],
    );
  });
});

describe("AccountDetails", () => {
  beforeEach(() => {
    monthParam = null;
  });

  it("renders totals, the category mix and newest-first rows", () => {
    const html = render();

    expect(html).toContain("Category mix");
    expect(html).toContain("3 entries");
    expect(html).toContain("Split with Mika");
    expect(html).toContain("+￥385,000");
    expect(html).toContain("−￥95,000");

    const order = ["03/14", "03/10", "03/05"].map((date) =>
      html.indexOf(`>${date}<`),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it("shows empty states for a month without entries", () => {
    const html = render([]);

    expect(html).toContain("No spending in March 2026.");
    expect(html).toContain("No transactions in March 2026.");
  });

  it("shows the loading skeleton while another month is requested", () => {
    monthParam = "2026-02";
    const html = render();

    expect(html).toContain("loading…");
    expect(html).not.toContain("Supermarket");
  });

  it("treats a malformed month param as the initial month", () => {
    monthParam = "nope";
    const html = render();

    expect(html).not.toContain("loading…");
    expect(html).toContain("Supermarket");
  });
});
