import { renderToStaticMarkup } from "react-dom/server";
import type { Transaction } from "@/types";
import TransactionList from "./TransactionList";

vi.mock("./TransactionCard", () => ({
  default: ({ transaction }: { transaction: { title: string } }) => (
    <li>{transaction.title}</li>
  ),
}));

const transactions: Transaction[] = [
  {
    id: "tx-1",
    title: "Coffee",
    type: "expense",
    category_name: "Food",
    amount: 500,
    currency: "JPY",
    date: new Date("2026-01-01T00:00:00.000Z"),
  },
  {
    id: "tx-2",
    title: "Salary",
    type: "income",
    category_name: "Salary",
    amount: 3000,
    currency: "JPY",
    date: new Date("2026-01-02T00:00:00.000Z"),
  },
];

describe("TransactionList", () => {
  it("renders one list item per transaction", () => {
    const html = renderToStaticMarkup(
      <TransactionList transactions={transactions} />,
    );

    expect(html).toContain("Coffee");
    expect(html).toContain("Salary");
    expect((html.match(/<li/g) ?? []).length).toBe(2);
  });
});
