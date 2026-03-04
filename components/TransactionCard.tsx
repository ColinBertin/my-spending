import { Transaction } from "../types";
import { FinanceIcon } from "./FinanceIcon";
import { formatCurrencyIntoYen } from "../helpers";
import TransactionFlowIcon from "./TransactionFlowIcon";

type TransactionCardProps = {
  transaction: Transaction;
};

export default function TransactionCard({ transaction }: TransactionCardProps) {
  const isIncome = transaction.type === "income";

  return (
    <li className="mb-2 flex w-full items-center justify-between gap-3 rounded-xl bg-gray-50 px-3 py-2">
      <div className="flex min-w-0 items-center gap-3">
        <TransactionFlowIcon type={transaction.type} />
        {transaction.category_icon && transaction.category_icon_pack && (
          <FinanceIcon
            icon={transaction.category_icon}
            iconPack={transaction.category_icon_pack}
            iconColor={transaction.category_color || ""}
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium">{transaction.title}</p>
          <p className="text-sm text-gray-500">
            {(transaction.date instanceof Date
              ? transaction.date
              : new Date(transaction.date)
            ).toLocaleString()}
          </p>
        </div>
      </div>
      <p
        className={`shrink-0 font-semibold ${
          isIncome ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        {formatCurrencyIntoYen(Number(transaction.amount))}
      </p>
    </li>
  );
}
