import { renderToStaticMarkup } from "react-dom/server";
import type { Transaction } from "@/types";
import TransactionCard from "./TransactionCard";

vi.mock("./FinanceIcon", () => ({
  FinanceIcon: () => <span>MockIcon</span>,
}));

const baseTransaction: Transaction = {
  id: "tx-1",
  title: "Groceries",
  type: "expense",
  category_name: "Food",
  amount: 1200,
  currency: "JPY",
  date: new Date("2026-01-10T10:30:00.000Z"),
};

describe("TransactionCard", () => {
  it("renders title and formatted amount", () => {
    const html = renderToStaticMarkup(
      <TransactionCard transaction={baseTransaction} />,
    );

    expect(html).toContain("Groceries");
    expect(html).toContain("1,200");
  });

  it("renders category icon when icon data exists", () => {
    const html = renderToStaticMarkup(
      <TransactionCard
        transaction={{
          ...baseTransaction,
          category_icon: "HiCoffee",
          category_icon_pack: "hi",
          category_color: "rose",
        }}
      />,
    );

    expect(html).toContain("MockIcon");
  });
});
