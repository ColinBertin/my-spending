import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export default function Radio({
  className,
  ...props
}: Omit<ComponentProps<"input">, "type">) {
  return (
    <input
      type="radio"
      data-slot="radio"
      className={cn("sr-only", className)}
      {...props}
    />
  );
}
