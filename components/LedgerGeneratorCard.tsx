import { ReactNode } from "react";

type LedgerGeneratorCardProps = {
  markColor: string;
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
  action?: ReactNode;
};

export default function LedgerGeneratorCard({
  markColor,
  eyebrow,
  title,
  description,
  children,
  action,
}: LedgerGeneratorCardProps) {
  return (
    <section className="flex min-w-0 flex-col gap-[10px] rounded-[12px] border border-[#E3DFD7] bg-white p-[18px]">
      <div className="flex items-center gap-[9px]">
        <span
          aria-hidden
          className="h-[9px] w-[9px] flex-none rounded-[2px]"
          style={{ backgroundColor: markColor }}
        />
        <span className="font-mono text-[10px] leading-none font-medium tracking-[0.12em] text-[#5C5952] uppercase">
          {eyebrow}
        </span>
      </div>
      <h2 className="text-[15px] leading-[1.3] font-semibold">{title}</h2>
      <p className="text-[12px] leading-[1.6] text-[#6B6760]">{description}</p>
      {children && <div className="flex-1">{children}</div>}
      {action && <div className="mt-1 flex gap-[7px]">{action}</div>}
    </section>
  );
}
