import clsx from "clsx";
import { RecentActivityItem } from "@/types";
import { formatCurrencyIntoYen } from "@/helpers";

type RecentActivityCardProps = {
  items: RecentActivityItem[];
};

export default function RecentActivityCard({ items }: RecentActivityCardProps) {
  return (
    <section className="mt-4 overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
      <div className="flex items-baseline justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] py-[15px]">
        <h2 className="text-[14px] font-semibold">Recent activity</h2>
        <span className="text-[12px] font-medium text-[#3B3934]">View all</span>
      </div>
      {items.length === 0 ? (
        <p className="px-[18px] py-6 text-center text-[13px] text-[#6B6760]">
          No recent activity for this month.
        </p>
      ) : (
        items.map((item, index) => (
          <div
            key={item.id}
            className={clsx(
              "flex items-center gap-[13px] px-[18px] py-3",
              index !== items.length - 1 && "border-b border-[#F1EEE8]",
            )}
          >
            <div className="w-11 flex-none font-mono text-[11px] text-[#5C5952]">
              {item.date}
            </div>
            <div className="flex-none rounded-[6px] bg-[#F4F1EA] px-2 py-[5px] font-mono text-[10px] tracking-[0.06em] whitespace-nowrap text-[#6B6760]">
              {item.category}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-medium">
                {item.title}
              </div>
              <div className="mt-[2px] text-[11px] text-[#5C5952]">
                {item.accountName}
              </div>
            </div>
            <div
              className={clsx(
                "flex-none font-mono text-[13px] font-medium tabular-nums",
                item.type === "income" ? "text-[#0E7C66]" : "text-[#17161A]",
              )}
            >
              {item.type === "income" ? "+" : "−"}
              {formatCurrencyIntoYen(Math.abs(item.amount))}
            </div>
          </div>
        ))
      )}
    </section>
  );
}
