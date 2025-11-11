import { Transaction } from "@/types/firestore";
import TransactionList from "./TransactionList";

export default function MonthlyTransactions({
  transactions,
}: {
  accountId: string;
  transactions?: Transaction[];
}) {
  return (
    <div className="h-80 w-full px-2 overflow-y-auto">
      {transactions && transactions.length > 0 ? (
        <TransactionList transactions={transactions} />
      ) : (
        <p className="font-bold">No transactions found.</p>
      )}
    </div>
  );
}
