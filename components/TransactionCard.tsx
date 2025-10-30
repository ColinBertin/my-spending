import { Transaction } from "@/types/firestore";
import { FinanceIcon } from "./FinanceIcon";
import { formatCurrencyIntoYen } from "@/helpers";

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <li className="py-3 flex w-80 space-x-4 items-center">
      {transaction.categoryIcon && (
        <FinanceIcon icon={transaction.categoryIcon} />
      )}
      <div className="flex flex-col">
        <p>
          {transaction.title}{" "}
          <small>
            {(transaction.date instanceof Date
              ? transaction.date
              : new Date(transaction.date)
            ).toLocaleString()}
          </small>
        </p>
        <p>{formatCurrencyIntoYen(transaction.amount)}</p>
      </div>
    </li>
  );
}
