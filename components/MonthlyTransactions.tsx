import { CategoryTotal } from "../types";
import { formatCurrencyIntoYen } from "../helpers";
import { FinanceIcon } from "./FinanceIcon";
import TransactionFlowIcon from "./TransactionFlowIcon";

export default function MonthlyTransactions({
  categoryTotals,
}: {
  categoryTotals: CategoryTotal[];
}) {
  return (
    <div className="h-72 w-full px-1 overflow-y-auto flex justify-center">
      {categoryTotals.length > 0 ? (
        <ul className="w-full max-w-sm flex flex-col items-center">
          {categoryTotals.map((item) => (
            <li
              key={`${item.type}-${item.category}`}
              className="mb-2 flex w-full items-center gap-3 rounded-xl bg-gray-50 px-3 py-2"
            >
              <TransactionFlowIcon type={item.type} className="h-7 w-7" />
              {item.category_icon && item.category_icon_pack && (
                <FinanceIcon
                  icon={item.category_icon}
                  iconPack={item.category_icon_pack}
                  iconColor={item.category_color || ""}
                />
              )}
              <div className="flex min-w-0 flex-col">
                <p>{item.category}</p>
                <p
                  className={`font-medium ${
                    item.type === "income"
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {formatCurrencyIntoYen(item.total)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="font-bold text-center">No spending found.</p>
      )}
    </div>
  );
}
