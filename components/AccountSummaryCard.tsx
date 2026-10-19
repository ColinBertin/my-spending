import clsx from "clsx";
import { AccountMonthlySummary } from "@/types";
import { formatCurrencyIntoYen } from "@/helpers";

type AccountSummaryCardProps = {
  account: AccountMonthlySummary;
};

export default function AccountSummaryCard({
  account,
}: AccountSummaryCardProps) {
  const isProfessional = account.type === "professional";

  return (
    <section className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
      <div className="flex items-start justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] pt-[22px] pb-[20px]">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="h-[15px] text-[15px] leading-[15px] font-semibold">
              {account.name}
            </h3>
            <span
              className={clsx(
                "inline-flex h-[17px] items-center rounded-[5px] px-[7px] font-mono text-[9px] font-medium tracking-[0.1em] uppercase",
                isProfessional
                  ? "bg-[#FCEDE8] text-[#B0442A]"
                  : "bg-[#F1EEE8] text-[#6B6760]",
              )}
            >
              {account.type}
            </span>
          </div>
          <div className="mt-[7px] h-[11px] font-mono text-[11px] leading-[11px] text-[#5C5952]">
            {account.currency} · {account.entryCount} ENTRIES
          </div>
        </div>
        <button className="h-[30px] cursor-pointer rounded-[8px] border border-[#E3DFD7] bg-[#F7F5F1] px-[11px] text-[12px] font-medium text-[#3B3934]">
          Open
        </button>
      </div>
      <div className="px-[18px] pt-[22px] pb-[24px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-[10px] text-[10px] leading-[10px] font-medium tracking-[0.14em] text-[#5C5952] uppercase">
              Balance
            </div>
            <div className="mt-2 h-[26px] font-mono text-[26px] leading-[26px] font-semibold tracking-[-0.02em] tabular-nums whitespace-nowrap">
              {formatCurrencyIntoYen(account.balance)}
            </div>
          </div>
          <div className="flex flex-col items-end gap-[6px]">
            <div className="h-[12px] font-mono text-[12px] leading-[12px] font-medium tabular-nums text-[#0E7C66]">
              +{formatCurrencyIntoYen(account.income)}
            </div>
            <div className="h-[12px] font-mono text-[12px] leading-[12px] font-medium tabular-nums text-[#B0442A]">
              −{formatCurrencyIntoYen(account.spending)}
            </div>
          </div>
        </div>
        <div className="mt-[14px] flex h-2 overflow-hidden rounded-[4px] bg-[#F1EEE8]">
          <div
            className="h-full"
            style={{
              width: `${Math.min(Math.max(account.savedPercentage, 0), 100)}%`,
              backgroundColor: isProfessional ? "#E8552F" : "#17161A",
            }}
          />
        </div>
        <div className="mt-[7px] flex justify-between font-mono text-[10px] leading-[10px] text-[#5C5952]">
          <span>SAVED {account.savedPercentage.toFixed(1)}%</span>
          <span>SPENT {account.spentPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </section>
  );
}
