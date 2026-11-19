import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export const labelClassName =
  "mb-3 block text-xs leading-none font-medium text-ink-subtle";

export default function Label({
  className,
  ...props
}: ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(labelClassName, className)}
      {...props}
    />
  );
}
