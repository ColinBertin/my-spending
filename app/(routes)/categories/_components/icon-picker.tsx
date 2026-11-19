import type { CSSProperties } from "react";
import {
  Controller,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import type { Category } from "@/types";
import { financeIcons } from "@/helpers";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";
import { darkenHex } from "../category-cards";
import { getCategoryIcon } from "../category-tile";

const ICON_OPTIONS = Object.entries(financeIcons).flatMap(([pack, names]) =>
  names.flatMap((name) => {
    const Icon = getCategoryIcon(pack, name);
    return Icon ? [{ pack, name, Icon }] : [];
  }),
);

type IconPickerProps = {
  control: Control<Category>;
  setValue: UseFormSetValue<Category>;
  hex: string;
  error?: string;
  className?: string;
};

export default function IconPicker({
  control,
  setValue,
  hex,
  error,
  className,
}: IconPickerProps) {
  return (
    <fieldset className={className}>
      <FieldLegend>Icon</FieldLegend>
      <Controller
        name="icon"
        control={control}
        rules={{ required: "Pick an icon" }}
        render={({ field }) => (
          <div
            className="relative flex max-h-50 flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-lg border border-hairline bg-surface-field p-3 sm:max-h-46"
            style={{ "--category-accent": darkenHex(hex) } as CSSProperties}
          >
            {ICON_OPTIONS.map(({ pack, name, Icon }) => (
              <label
                key={`${pack}-${name}`}
                title={name}
                className="flex size-11 flex-none cursor-pointer items-center justify-center rounded-control border border-hairline bg-white text-ink-muted has-checked:border-2 has-checked:border-ink has-checked:bg-white has-checked:text-(--category-accent) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink sm:size-10"
              >
                <Radio
                  name={field.name}
                  value={name}
                  aria-label={name}
                  checked={field.value === name}
                  onBlur={field.onBlur}
                  onChange={() => {
                    setValue("icon_pack", pack);
                    field.onChange(name);
                  }}
                />
                <Icon className="size-4.75" aria-hidden />
              </label>
            ))}
          </div>
        )}
      />
      <FieldError message={error} />
    </fieldset>
  );
}
