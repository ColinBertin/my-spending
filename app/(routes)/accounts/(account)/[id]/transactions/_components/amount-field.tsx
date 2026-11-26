import clsx from "clsx";
import type { UseFormRegister } from "react-hook-form";
import type { Transaction } from "@/types";
import { FieldError } from "@/components/ui/Field";
import { CURRENCIES } from "@/app/(routes)/accounts/_components/currency-picker";

type AmountFieldProps = {
  register: UseFormRegister<Transaction>;
  /** Symbol of the currently selected currency, shown before the amount. */
  currencySymbol: string;
  error?: string;
  className?: string;
};

export default function AmountField({
  register,
  currencySymbol,
  error,
  className,
}: AmountFieldProps) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 font-mono text-xs leading-none font-medium tracking-widest text-ink-muted uppercase">
        <label htmlFor="transaction-amount">Amount</label>
        <span aria-hidden>·</span>
        <select
          aria-label="Currency"
          className="cursor-pointer rounded-sm bg-transparent font-mono tracking-widest text-ink-muted uppercase outline-none hover:text-ink focus-visible:outline-1 focus-visible:outline-ink"
          {...register("currency", { required: "Currency is required" })}
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code}
            </option>
          ))}
        </select>
      </div>
      <div
        className={clsx(
          "flex items-baseline gap-2 border-b pt-2.5 pb-3.5",
          error ? "border-negative" : "border-hairline",
        )}
      >
        <span className="font-mono text-2xl leading-none font-medium text-ink-muted">
          {currencySymbol}
        </span>
        <input
          id="transaction-amount"
          type="number"
          inputMode="decimal"
          step="any"
          min="0"
          placeholder="0"
          aria-invalid={Boolean(error)}
          className="w-full min-w-0 appearance-none bg-transparent font-mono text-3xl leading-none font-semibold tracking-tight tabular-nums outline-none placeholder:text-graphic-grey md:text-4xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          {...register("amount", {
            required: "Amount is required",
            validate: (value) =>
              Number(value) > 0 || "An amount above zero is required",
          })}
        />
      </div>
      <FieldError message={error} />
    </div>
  );
}
