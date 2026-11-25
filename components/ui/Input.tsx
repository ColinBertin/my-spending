import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import Label from "./Label";
import { FieldError } from "./Field";

type InputProps = {
  errorMessage?: string;
  subText?: string;
  containerClassName?: string;
} & ComponentProps<"input">;

export default function Input({
  className,
  containerClassName,
  title,
  errorMessage,
  subText,
  type = "text",
  "aria-describedby": ariaDescribedBy,
  ...props
}: InputProps) {
  const hintId = subText && props.id ? `${props.id}-hint` : undefined;
  const describedBy =
    [ariaDescribedBy, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={containerClassName}>
      {title && <Label htmlFor={props.id}>{title}</Label>}
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-11 w-full rounded-control border border-hairline bg-surface-field px-3 text-sm text-ink outline-none",
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
