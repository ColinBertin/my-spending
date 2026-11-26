import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import Label from "./Label";
import { FieldError } from "./Field";

type TextareaProps = {
  errorMessage?: string;
  subText?: string;
  containerClassName?: string;
  optional?: boolean;
} & ComponentProps<"textarea">;

export default function Textarea({
  className,
  containerClassName,
  title,
  optional = false,
  errorMessage,
  subText,
  rows = 3,
  "aria-describedby": ariaDescribedBy,
  ...props
}: TextareaProps) {
  const hintId = subText && props.id ? `${props.id}-hint` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={containerClassName}>
      {title && (
        <Label htmlFor={props.id}>
          {title}
          {optional && <span className="ml-1 text-graphic-grey">optional</span>}
        </Label>
      )}
      <textarea
        rows={rows}
        data-slot="textarea"
        className={cn(
          "min-h-16.5 w-full rounded-control border border-hairline bg-surface-field px-3 py-2.75 text-sm leading-normal text-ink outline-none placeholder:text-graphic-grey",
          "focus:border-2 focus:bg-white focus:not-aria-invalid:border-ink",
          "aria-invalid:border-2 aria-invalid:border-negative aria-invalid:bg-white",
          className,
        )}
        aria-describedby={describedBy}
        {...props}
      />
      {subText && (
        <p id={hintId} className="mt-2 text-xs leading-normal text-ink-subtle">
          {subText}
        </p>
      )}
      <FieldError message={errorMessage} />
    </div>
  );
}
