import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { fromLocalInputDate, toLocalInputDate } from "@/lib/dates";
import Input from "./Input";

type DatePickerProps = Omit<
  ComponentProps<typeof Input>,
  "type" | "value" | "defaultValue" | "onChange" | "max" | "min"
> & {
  value?: Date | string | null;
  onChange?: (value: Date | undefined) => void;
  max?: Date;
  min?: Date;
};

export default function DatePicker({
  value,
  onChange,
  max,
  min,
  className,
  ...props
}: DatePickerProps) {
  return (
    <Input
      type="date"
      className={cn("font-mono", className)}
      value={value ? toLocalInputDate(value) : ""}
      max={max ? toLocalInputDate(max) : undefined}
      min={min ? toLocalInputDate(min) : undefined}
      onChange={(event) =>
        onChange?.(
          event.target.value
            ? fromLocalInputDate(event.target.value)
            : undefined,
        )
      }
      {...props}
    />
  );
}
