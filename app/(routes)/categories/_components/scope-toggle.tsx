import clsx from "clsx";
import type { UseFormRegister } from "react-hook-form";
import type { Category } from "@/types";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";

export const SCOPES: { id: NonNullable<Category["type"]>; name: string }[] = [
  { id: "normal", name: "Normal" },
  { id: "professional", name: "Professional" },
];

type ScopeToggleProps = {
  register: UseFormRegister<Category>;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export default function ScopeToggle({
  register,
  error,
  disabled = false,
  className,
}: ScopeToggleProps) {
  return (
    <fieldset className={className} disabled={disabled}>
      <FieldLegend>Scope</FieldLegend>
      <div className="flex">
        {SCOPES.map((scope, index) => (
          <label
            key={scope.id}
            className={clsx(
              "flex h-11 cursor-pointer items-center border border-hairline bg-surface-field px-3.75 text-xs leading-none font-medium text-ink-subtle has-checked:border-ink has-checked:bg-ink has-checked:text-surface-app has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink has-disabled:cursor-not-allowed has-disabled:opacity-60 sm:h-10",
              index === 0 ? "rounded-l-control" : "-ml-px rounded-r-control",
            )}
          >
            <Radio
              value={scope.id}
              {...register("type", { required: "Scope is required" })}
            />
            {scope.name}
          </label>
        ))}
      </div>
      <p className="mt-2 text-xs leading-normal text-ink-subtle">
        {disabled
          ? "Scope can't be changed after creation, so ledger exports stay consistent."
          : "Professional categories are the ones available to 元帳 exports."}
      </p>
      <FieldError message={error} />
    </fieldset>
  );
}
