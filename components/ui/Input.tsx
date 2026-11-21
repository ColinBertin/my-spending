import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import Label from "./Label";
import { FieldError } from "./Field";

type InputProps = {
  errorMessage?: string;
} & ComponentProps<"input">;

export default function Input({
  className,
  title,
  errorMessage,
  type = "text",
  ...props
}: InputProps) {
  return (
    <div>
      <Label htmlFor="account-name" className="mt-8">
        {title}
      </Label>
      <input
        type={type}
        data-slot="input"
        className={cn(
          "h-11 w-full rounded-control border border-hairline bg-surface-field px-3 text-sm text-ink outline-none",
          "focus:border-2 focus:bg-white focus:not-aria-invalid:border-ink",
          "aria-invalid:border-2 aria-invalid:border-negative aria-invalid:bg-white",
          className,
        )}
        {...props}
      />
      <FieldError message={errorMessage} />
    </div>
  );
}
