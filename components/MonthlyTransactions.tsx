import { Transaction } from "@/types";
import TransactionList from "./TransactionList";

export default function MonthlyTransactions({
  transactions,
}: {
  accountId: string;
  transactions?: Transaction[];
}) {
  return (
    <div className="h-72 w-full px-1 overflow-y-auto flex justify-center">
      {transactions && transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <p className="font-bold text-center">No transactions found.</p>
      )}
    </div>
  );
}
