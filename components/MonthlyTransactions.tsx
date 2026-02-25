import { CategoryTotal } from "@/types";
import { formatCurrencyIntoYen } from "@/helpers";
import { FinanceIcon } from "./FinanceIcon";

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
              key={item.category}
              className="py-1.5 flex w-full space-x-4 items-center bg-gray-50 rounded-xl px-3 mb-2"
            >
              {item.category_icon && item.category_icon_pack && (
                <FinanceIcon
                  icon={item.category_icon}
                  iconPack={item.category_icon_pack}
                  iconColor={item.category_color || ""}
                />
              )}
              <div className="flex flex-col">
                <p>{item.category}</p>
                <p>{formatCurrencyIntoYen(item.total)}</p>
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
