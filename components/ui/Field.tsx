import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";
import { labelClassName } from "./Label";

export function FieldLegend({ className, ...props }: ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(labelClassName, className)}
      {...props}
    />
  );
}

export function FieldError({
  message,
  className,
  ...props
}: ComponentProps<"div"> & { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn("mt-2 flex items-center gap-1.75", className)}
      {...props}
    >
      <span className="size-1.25 flex-none rounded-full bg-negative" />
      <span className="text-xs leading-snug text-negative">{message}</span>
    </div>
  );
}
