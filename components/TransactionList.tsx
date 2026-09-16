import { Transaction } from "../types";
import TransactionCard from "./TransactionCard";

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <ul className="w-full max-w-sm flex flex-col items-center">
      {transactions &&
        transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
    </ul>
  );
}
