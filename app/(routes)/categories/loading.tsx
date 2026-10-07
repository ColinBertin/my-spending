import PageLayout from "@/components/ui/PageLayout";

const SKELETON_CARDS = [
  ["58%", "44%", "52%", "82%"],
  ["66%", "38%", "46%", "64%"],
  ["52%", "48%", "58%", "100%"],
  ["62%", "34%", "40%", "38%"],
  ["56%", "42%", "50%", "56%"],
  ["70%", "36%", "44%", "26%"],
  ["48%", "46%", "54%", "72%"],
];

export default function Loading() {
  return (
    <PageLayout>
      <div aria-busy aria-label="Loading categories">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-[14px]">
          <div>
            <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
              Categories
            </h1>
            <div
              aria-hidden
              className="mt-[10px] h-[11px] w-[220px] animate-pulse rounded-[4px] bg-[#F1EEE8]"
            />
          </div>
          <div className="flex animate-pulse gap-2" aria-hidden>
            <span className="h-[42px] w-[186px] rounded-[9px] bg-[#F1EEE8] md:h-[38px]" />
            <span className="h-[42px] w-[118px] rounded-[9px] bg-[#F1EEE8] md:h-[38px]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {SKELETON_CARDS.map(
            ([nameWidth, usageWidth, totalWidth, bar], index) => (
              <div
                key={index}
                aria-hidden
                className="flex min-w-0 animate-pulse flex-col gap-3 rounded-[12px] border border-[#E3DFD7] bg-white px-[15px] py-[14px]"
              >
                <div className="flex items-center gap-[10px]">
                  <span className="h-8 w-8 flex-none rounded-[9px] bg-[#F1EEE8]" />
                  <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                    <span
                      className="h-[11px] rounded-[4px] bg-[#F1EEE8]"
                      style={{ width: nameWidth }}
                    />
                    <span
                      className="h-[9px] rounded-[4px] bg-[#F1EEE8]"
                      style={{ width: usageWidth }}
                    />
                  </span>
                </div>
                <span
                  className="h-[15px] rounded-[4px] bg-[#F1EEE8]"
                  style={{ width: totalWidth }}
                />
                <span className="h-1 overflow-hidden rounded-[2px] bg-[#F1EEE8]">
                  <span
                    className="block h-full rounded-[2px] bg-[#E3DFD7]"
                    style={{ width: bar }}
                  />
                </span>
              </div>
            ),
          )}
          <div
            className="min-h-[112px] rounded-[12px] border-[1.5px] border-dashed border-[#C9C3B7] bg-[#FBFAF7]"
            aria-hidden
          />
        </div>
      </div>
    </PageLayout>
  );
}
