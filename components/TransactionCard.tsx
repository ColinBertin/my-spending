import { Transaction } from "@/types";
import { FinanceIcon } from "./FinanceIcon";
import { formatCurrencyIntoYen } from "@/helpers";

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <li className="py-1 flex w-80 space-x-4 items-center bg-gray-50 rounded-xl px-2 mb-2">
      {transaction.category_icon && transaction.category_icon_pack && (
        <FinanceIcon
          icon={transaction.category_icon}
          iconPack={transaction.category_icon_pack}
          iconColor={transaction.category_color || ""}
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
        <p>{formatCurrencyIntoYen(Number(transaction.amount))}</p>
      </div>
    </li>
  );
}
