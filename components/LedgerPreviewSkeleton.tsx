import StatTileSkeleton from "@/components/StatTileSkeleton";
import PageLayout from "@/components/layout/PageLayout";

const SKELETON_ROWS = [
  ["72%", "48%", "64%"],
  ["58%", "62%", "52%"],
  ["66%", "40%", "70%"],
  ["50%", "56%", "46%"],
  ["70%", "44%", "60%"],
  ["62%", "52%", "56%"],
];

const COLUMN_WIDTHS = [
  "w-[86px]",
  "w-[150px]",
  "",
  "w-[110px]",
  "w-[110px]",
  "w-[110px]",
  "w-[84px]",
];

export default function LedgerPreviewSkeleton({ label }: { label: string }) {
  return (
    <PageLayout>
      <div
        className="flex min-w-0 flex-col gap-4"
        aria-busy
        aria-label={`Loading ${label}`}
      >
        <div
          aria-hidden
          className="flex animate-pulse flex-wrap items-end justify-between gap-[14px]"
        >
          <div className="flex flex-col gap-2">
            <span className="h-3 w-28 rounded-[4px] bg-[#F1EEE8] md:hidden" />
            <span className="h-[26px] w-[260px] max-w-full rounded-[6px] bg-[#F1EEE8] md:h-[32px] md:w-[340px]" />
            <span className="h-[11px] w-[200px] rounded-[4px] bg-[#F1EEE8]" />
          </div>
          <span className="h-[42px] w-[92px] rounded-[9px] bg-[#F1EEE8] md:h-[38px]" />
        </div>

        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-[#E3DFD7] lg:grid-cols-4">
          <StatTileSkeleton size="sm" />
          <StatTileSkeleton size="sm" />
          <StatTileSkeleton size="sm" />
          <StatTileSkeleton size="sm" />
        </div>

        <div
          aria-hidden
          className="hidden overflow-hidden rounded-[12px] border border-[#D9D4C9] bg-white md:block"
        >
          <div className="flex border-b border-[#D9D4C9] bg-[#F4F1EA]">
            {COLUMN_WIDTHS.map((width, index) => (
              <span
                key={index}
                className={`h-[52px] flex-none border-r border-[#E3DFD7] last:border-r-0 ${width || "flex-1"}`}
              />
            ))}
          </div>
          {SKELETON_ROWS.map(
            ([accountWidth, descriptionWidth, amountWidth], index) => (
              <div
                key={index}
                className="flex animate-pulse border-b border-[#F1EEE8] last:border-b-0"
              >
                <span className="w-[86px] flex-none px-3 py-[9px]">
                  <span className="block h-[11px] w-8 rounded-[3px] bg-[#F1EEE8]" />
                  <span className="mt-[5px] block h-[9px] w-4 rounded-[3px] bg-[#F1EEE8]" />
                </span>
                <span className="w-[150px] flex-none px-3 py-[9px]">
                  <span
                    className="block h-[11px] rounded-[3px] bg-[#F1EEE8]"
                    style={{ width: accountWidth }}
                  />
                </span>
                <span className="flex-1 px-3 py-[9px]">
                  <span
                    className="block h-[11px] rounded-[3px] bg-[#F1EEE8]"
                    style={{ width: descriptionWidth }}
                  />
                </span>
                {[0, 1, 2].map((column) => (
                  <span
                    key={column}
                    className="flex w-[110px] flex-none justify-end px-3 py-[9px]"
                  >
                    <span
                      className="block h-[11px] rounded-[3px] bg-[#F1EEE8]"
                      style={{ width: amountWidth }}
                    />
                  </span>
                ))}
                <span className="flex w-[84px] flex-none justify-center gap-[7px] px-3 py-[9px]">
                  <span className="h-7 w-7 rounded-[6px] bg-[#F1EEE8]" />
                  <span className="h-7 w-7 rounded-[6px] bg-[#F1EEE8]" />
                </span>
              </div>
            ),
          )}
        </div>

        <div aria-hidden className="flex flex-col gap-2 md:hidden">
          {SKELETON_ROWS.map(([accountWidth, descriptionWidth], index) => (
            <div
              key={index}
              className="animate-pulse rounded-[11px] border border-[#E3DFD7] bg-white px-[14px] py-[13px]"
            >
              <div className="flex justify-between gap-[10px]">
                <span className="h-[11px] w-20 rounded-[3px] bg-[#F1EEE8]" />
                <span
                  className="h-[11px] max-w-[40%] rounded-[3px] bg-[#F1EEE8]"
                  style={{ width: accountWidth }}
                />
              </div>
              <span
                className="mt-[10px] block h-[13px] rounded-[4px] bg-[#F1EEE8]"
                style={{ width: descriptionWidth }}
              />
              <div className="mt-[12px] flex justify-between gap-[10px]">
                <span className="h-[13px] w-[72px] rounded-[4px] bg-[#F1EEE8]" />
                <span className="h-[13px] w-[84px] rounded-[4px] bg-[#F1EEE8]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
