import type { UseFormRegister } from "react-hook-form";
import type { Account, Currency } from "@/types";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";

export const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: "JPY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
];

type CurrencyPickerProps = {
  register: UseFormRegister<Account>;
  error?: string;
  className?: string;
};

export default function CurrencyPicker({
  register,
  error,
  className,
}: CurrencyPickerProps) {
  return (
    <fieldset className={className}>
      <FieldLegend>Currency</FieldLegend>
      <div className="flex flex-wrap gap-2">
        {CURRENCIES.map((currency) => (
          <label
            key={currency.code}
            className="flex h-control-full cursor-pointer items-center rounded-control border border-hairline bg-surface-field px-3.75 font-mono text-sm font-medium text-ink has-checked:border-2 has-checked:border-ink has-checked:bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink sm:h-control-mobile"
          >
            <Radio
              value={currency.code}
              {...register("currency", { required: "Currency is required" })}
            />
            {currency.symbol} {currency.code}
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
