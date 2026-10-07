import clsx from "clsx";
import StatTileSkeleton from "@/components/StatTileSkeleton";

const SKELETON_WIDTHS = [
  ["62%", "38%"],
  ["58%", "46%"],
  ["66%", "30%"],
  ["54%", "42%"],
  ["60%", "34%"],
];

const SKELETON_MIX_WIDTHS = ["56%", "44%", "62%", "38%"];

export function TransactionRowsSkeleton() {
  return SKELETON_WIDTHS.map(([titleWidth, noteWidth], index) => (
    <div
      key={index}
      aria-hidden
      className={clsx(
        "flex animate-pulse items-center gap-[13px] px-[18px] py-3",
        index !== SKELETON_WIDTHS.length - 1 && "border-b border-[#F1EEE8]",
      )}
    >
      <span className="h-[11px] w-11 flex-none rounded-[4px] bg-[#F1EEE8]" />
      <span className="h-5 w-[58px] flex-none rounded-[6px] bg-[#F1EEE8]" />
      <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
        <span
          className="h-[11px] rounded-[4px] bg-[#F1EEE8]"
          style={{ width: titleWidth }}
        />
        <span
          className="h-[9px] rounded-[4px] bg-[#F1EEE8]"
          style={{ width: noteWidth }}
        />
      </span>
      <span className="h-3 w-16 flex-none rounded-[4px] bg-[#F1EEE8]" />
    </div>
  ));
}

export default function AccountDetailsSkeleton() {
  return (
    <div
      className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr]"
      aria-busy
      aria-label="Loading account details"
    >
      <section className="rounded-[12px] border border-[#E3DFD7] bg-white px-[18px] py-5">
        <h2 className="mb-[18px] text-[14px] leading-none font-semibold">
          Category mix
        </h2>
        <div className="flex justify-center pt-[6px] pb-[14px]">
          <div className="relative h-[180px] w-[180px] animate-pulse rounded-full bg-[#F1EEE8] sm:h-[200px] sm:w-[200px]">
            <div className="absolute inset-[26px] rounded-full bg-white" />
          </div>
        </div>
        <div className="flex flex-col gap-[9px] border-t border-[#E3DFD7] pt-[14px]">
          {SKELETON_MIX_WIDTHS.map((width, index) => (
            <div
              key={index}
              aria-hidden
              className="flex animate-pulse items-center gap-[9px]"
            >
              <span className="h-[9px] w-[9px] flex-none rounded-[2px] bg-[#F1EEE8]" />
              <span className="flex-1">
                <span
                  className="block h-[10px] rounded-[3px] bg-[#F1EEE8]"
                  style={{ width }}
                />
              </span>
              <span className="h-[10px] w-14 rounded-[3px] bg-[#F1EEE8]" />
              <span className="h-[10px] w-[30px] rounded-[3px] bg-[#F1EEE8]" />
            </div>
          ))}
        </div>
      </section>

      <div className="flex min-w-0 flex-col gap-4">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7]">
          <StatTileSkeleton />
          <StatTileSkeleton />
        </div>

        <section className="overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] py-[14px]">
            <h2 className="text-[14px] leading-none font-semibold">
              Transactions{" "}
              <span className="font-mono text-[12px] font-normal text-[#5C5952]">
                loading…
              </span>
            </h2>
            <div className="flex animate-pulse gap-1" aria-hidden>
              <span className="h-7 w-9 rounded-[7px] bg-[#F1EEE8]" />
              <span className="h-7 w-[58px] rounded-[7px] bg-[#F1EEE8]" />
              <span className="h-7 w-[62px] rounded-[7px] bg-[#F1EEE8]" />
            </div>
          </div>
          <TransactionRowsSkeleton />
        </section>
      </div>
    </div>
  );
}
