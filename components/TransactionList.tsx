// import { formatCurrencyIntoYen } from "@/helpers";
import { Transaction } from "@/types/firestore";
// import { FinanceIcon } from "./FinanceIcon";
import TransactionCard from "./TransactionCard";

type TransactionListProps = {
  transactions: Transaction[];
};

export default function TransactionList({
  transactions,
}: TransactionListProps) {
  return (
    <ul className="divide-y border border-gray-200 bg-white rounded p-2 h-96 overflow-y-auto">
      {transactions &&
        transactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
    </ul>
  );
}
