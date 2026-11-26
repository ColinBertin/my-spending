import clsx from "clsx";
import type { UseFormRegister } from "react-hook-form";
import type { Transaction, TransactionType } from "@/types";
import Radio from "@/components/ui/Radio";

export const TRANSACTION_TYPES: {
  id: TransactionType;
  label: string;
  activeClassName: string;
}[] = [
  {
    id: "expense",
    label: "Expense",
    activeClassName: "has-checked:after:bg-brand",
  },
  {
    id: "income",
    label: "Income",
    activeClassName: "has-checked:after:bg-positive",
  },
];

type TransactionTypeTabsProps = {
  register: UseFormRegister<Transaction>;
  className?: string;
};

export default function TransactionTypeTabs({
  register,
  className,
}: TransactionTypeTabsProps) {
  return (
    <fieldset
      className={clsx("grid grid-cols-2 gap-px bg-hairline", className)}
    >
      <legend className="sr-only">Type</legend>
      {TRANSACTION_TYPES.map((option) => (
        <label
          key={option.id}
          className={clsx(
            "relative flex h-control-full cursor-pointer after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 items-center justify-center bg-surface-field text-sm font-medium text-ink-subtle has-checked:bg-white has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-ink",
            option.activeClassName,
          )}
        >
          <Radio
            value={option.id}
            {...register("type", { required: "Type is required" })}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
