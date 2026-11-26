import PageLayout from "@/components/layout/PageLayout";

const BLOCK = "rounded-sm bg-surface-rail";

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
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3.5">
          <div>
            <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
              Categories
            </h1>
            <div
              aria-hidden
              className={`mt-2.5 h-2.75 w-55 animate-pulse ${BLOCK}`}
            />
          </div>
          <div className="flex animate-pulse gap-2" aria-hidden>
            <span className="h-control-mobile w-46.5 rounded-control bg-surface-rail md:h-control" />
            <span className="h-control-mobile w-29.5 rounded-control bg-surface-rail md:h-control" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
          {SKELETON_CARDS.map(
            ([nameWidth, usageWidth, totalWidth, bar], index) => (
              <div
                key={index}
                aria-hidden
                className="flex min-w-0 animate-pulse flex-col gap-3 rounded-card border border-hairline bg-white px-3.75 py-3.5"
              >
                <div className="flex min-w-0 justify-between gap-2">
                  <div className="flex min-w-0 flex-1 gap-2">
                    <span className="size-8 flex-none rounded-control bg-surface-rail" />
                    <span className="flex min-w-0 flex-1 flex-col gap-1.5 pt-0.5">
                      <span
                        className={`h-2.75 ${BLOCK}`}
                        style={{ width: nameWidth }}
                      />
                      <span
                        className={`h-2.25 ${BLOCK}`}
                        style={{ width: usageWidth }}
                      />
                    </span>
                  </div>
                  <span className="size-4.5 flex-none rounded-sm bg-surface-rail" />
                </div>
                <span
                  className={`h-3.75 ${BLOCK}`}
                  style={{ width: totalWidth }}
                />
                <span className="h-1 overflow-hidden rounded-xs bg-surface-rail">
                  <span
                    className="block h-full rounded-xs bg-hairline"
                    style={{ width: bar }}
                  />
                </span>
              </div>
            ),
          )}
          <div
            className="min-h-28 rounded-card border-[1.5px] border-dashed border-graphic-grey bg-surface-field"
            aria-hidden
          />
        </div>
      </div>
    </PageLayout>
  );
}
