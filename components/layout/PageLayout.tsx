import { ReactElement } from "react";
import { cn } from "@/lib/utils";

export default function PageLayout({
  children,
  className,
}: {
  children: ReactElement;
  className?: string;
}) {
  return <div className={cn("p-4 md:p-12", className)}>{children}</div>;
}
