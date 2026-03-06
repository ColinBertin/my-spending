import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";

type QuickLinkProps = {
  title: string;
  href: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  description: string;
};

export default function QuickLink({
  title,
  href,
  Icon,
  description,
}: QuickLinkProps) {
  return (
    <Link
      href={href}
      className="group mx-auto flex w-full max-w-xs items-center justify-between rounded-2xl border border-orange-dark/20 bg-gradient-to-br from-orange-dark to-orange-light px-4 py-3 text-white shadow-sm transition-transform transition-colors hover:-translate-y-0.5 hover:shadow-md sm:min-h-28 sm:flex-col sm:items-stretch sm:justify-between sm:px-4 sm:py-4"
    >
      <div className="flex min-w-0 items-center gap-3 sm:gap-2 sm:justify-around">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white/20 sm:h-10 sm:w-10">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 sm:mt-4">
          <p className="truncate text-sm font-semibold leading-5 sm:truncate-none">
            {title}
          </p>
          <p className="mt-1 hidden text-xs leading-5 text-white/85 sm:block">
            {description}
          </p>
        </div>
      </div>
      <ArrowRightIcon className="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1 sm:self-end" />
    </Link>
  );
}
