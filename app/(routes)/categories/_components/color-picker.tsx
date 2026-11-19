import type { UseFormRegister } from "react-hook-form";
import type { Category } from "@/types";
import { colorCodes } from "@/helpers";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";

const COLOR_OPTIONS = Object.entries(colorCodes) as [string, string][];

type ColorPickerProps = {
  register: UseFormRegister<Category>;
  error?: string;
  className?: string;
};

export default function ColorPicker({
  register,
  error,
  className,
}: ColorPickerProps) {
  return (
    <fieldset className={className}>
      <FieldLegend>Colour</FieldLegend>
      <div className="relative flex max-h-46 flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-lg border border-hairline bg-surface-field p-3 sm:max-h-43">
        {COLOR_OPTIONS.map(([code, swatch]) => (
          <label
            key={code}
            title={code}
            className="size-9.5 flex-none cursor-pointer rounded-control has-checked:ring-2 has-checked:ring-ink has-checked:ring-offset-2 has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-ink sm:size-8.5"
            style={{ backgroundColor: swatch }}
          >
            <Radio value={code} aria-label={code} {...register("color")} />
          </label>
        ))}
      </div>
      <FieldError message={error} />
    </fieldset>
  );
}
