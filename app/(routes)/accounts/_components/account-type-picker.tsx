import type { UseFormRegister } from "react-hook-form";
import type { Account } from "@/types";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";

export const ACCOUNT_TYPES: {
  id: Account["type"];
  name: string;
  description: string;
}[] = [
  {
    id: "single",
    name: "Single",
    description: "Just you. One balance, one owner.",
  },
  {
    id: "shared",
    name: "Shared",
    description: "Two people, split entries.",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Unlocks 元帳 export and account titles.",
  },
];

type AccountTypePickerProps = {
  register: UseFormRegister<Account>;
  error?: string;
  className?: string;
};

export default function AccountTypePicker({
  register,
  error,
  className,
}: AccountTypePickerProps) {
  return (
    <fieldset className={className}>
      <FieldLegend>Type</FieldLegend>
      <div className="grid grid-cols-1 gap-2.25 sm:grid-cols-3">
        {ACCOUNT_TYPES.map((accountType) => (
          <label
            key={accountType.id}
            className="group cursor-pointer rounded-lg border border-hairline bg-surface-field px-3.75 py-3.5 text-left has-checked:border-2 has-checked:border-ink has-checked:bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink"
          >
            <Radio
              value={accountType.id}
              {...register("type", { required: "Type is required" })}
            />
            <span className="flex items-center gap-2.5">
              <span className="size-3.75 flex-none rounded-full border-2 border-graphic-grey bg-white group-has-checked:border-4 group-has-checked:border-negative" />
              <span className="text-sm leading-none font-semibold">
                {accountType.name}
              </span>
            </span>
            <span className="mt-2.25 block text-xs leading-normal text-ink-subtle">
              {accountType.description}
            </span>
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
