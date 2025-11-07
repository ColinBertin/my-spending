import { Transaction } from "@/types/firestore";
import { FinanceIcon } from "./FinanceIcon";
import { formatCurrencyIntoYen } from "@/helpers";

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <li className="py-1 flex w-80 space-x-4 items-center bg-gray-50 rounded-xl px-2 mb-2">
      {transaction.categoryIcon && transaction.categoryIconPack && (
        <FinanceIcon
          icon={transaction.categoryIcon}
          iconPack={transaction.categoryIconPack}
        />
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
