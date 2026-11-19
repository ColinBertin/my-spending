import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export default function Input({
  className,
  type = "text",
  ...props
}: ComponentProps<"input">) {
  return (
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
  );
}
