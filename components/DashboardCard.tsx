import { ReactNode } from "react";

type DashboardCardProps = {
  title: string;
  eyebrow?: string;
  bodyClassName?: string;
  children: ReactNode;
};

export default function DashboardCard({
  title,
  eyebrow,
  bodyClassName,
  children,
}: DashboardCardProps) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
      <div className="flex items-baseline justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] py-[15px]">
        <h2 className="text-[14px] font-semibold">{title}</h2>
        {eyebrow && (
          <span className="text-[10px] font-medium tracking-[0.12em] text-[#5C5952] uppercase">
            {eyebrow}
          </span>
        )}
      </div>
      <div className={bodyClassName ?? "px-[18px] py-4"}>{children}</div>
    </div>
  );
}
