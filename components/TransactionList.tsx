import { formatCurrencyIntoYen } from "@/helpers";
import { Transaction } from "@/types/firestore";

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <ul>
      {transactions &&
        transactions.map((transaction) => (
          <li key={transaction.id}>
            {(transaction.date instanceof Date
              ? transaction.date
              : new Date(transaction.date)
            ).toLocaleString()}{" "}
            - {transaction.title}: {formatCurrencyIntoYen(transaction.amount)}
          </li>
        ))}
    </ul>
  );
}
