import { ArrowDown, ArrowUp } from "lucide-react";
import { TransactionType } from "../types";

type TransactionFlowIconProps = {
  type: TransactionType;
  className?: string;
};

export default function TransactionFlowIcon({
  type,
  className = "",
}: TransactionFlowIconProps) {
  const isIncome = type === "income";
  const Icon = isIncome ? ArrowDown : ArrowUp;
  const label = isIncome ? "Income" : "Expense";

  return (
    <span
      aria-label={label}
      title={label}
      className={[
        "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        isIncome
          ? "bg-emerald-100 text-emerald-600"
          : "bg-rose-100 text-rose-600",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}
