import PageLayout from "@/components/ui/PageLayout";

const SKELETON_ROWS = [
  ["58%", "34%"],
  ["44%", "40%"],
  ["66%", "30%"],
];

function SkeletonCard({ withRows }: { withRows: boolean }) {
  return (
    <div
      aria-hidden
      className="flex min-w-0 animate-pulse flex-col gap-[10px] rounded-[12px] border border-[#E3DFD7] bg-white p-[18px]"
    >
      <div className="flex items-center gap-[9px]">
        <span className="h-[9px] w-[9px] rounded-[2px] bg-[#E3DFD7]" />
        <span className="h-[10px] w-20 rounded-[3px] bg-[#F1EEE8]" />
      </div>
      <span className="h-[15px] w-[46%] rounded-[4px] bg-[#F1EEE8]" />
      <span className="flex flex-col gap-[6px]">
        <span className="h-[10px] w-[92%] rounded-[3px] bg-[#F1EEE8]" />
        <span className="h-[10px] w-[70%] rounded-[3px] bg-[#F1EEE8]" />
      </span>
      {withRows ? (
        <span className="flex flex-col divide-y divide-[#F1EEE8] border-t border-[#F1EEE8]">
          {SKELETON_ROWS.map(([nameWidth, metaWidth], index) => (
            <span
              key={index}
              className="flex items-center gap-[10px] py-[10px]"
            >
              <span className="flex min-w-0 flex-1 flex-col gap-[6px]">
                <span
                  className="h-[11px] rounded-[4px] bg-[#F1EEE8]"
                  style={{ width: nameWidth }}
                />
                <span
                  className="h-[9px] rounded-[3px] bg-[#F1EEE8]"
                  style={{ width: metaWidth }}
                />
              </span>
              <span className="h-8 w-[74px] rounded-[8px] bg-[#F1EEE8]" />
            </span>
          ))}
        </span>
      ) : (
        <>
          <span className="h-[10px] w-16 rounded-[3px] bg-[#F1EEE8]" />
          <span className="grid grid-cols-3 gap-2">
            <span className="h-[30px] rounded-[4px] bg-[#F1EEE8]" />
            <span className="h-[30px] rounded-[4px] bg-[#F1EEE8]" />
            <span className="h-[30px] rounded-[4px] bg-[#F1EEE8]" />
          </span>
          <span className="mt-1 h-9 w-[86px] rounded-[9px] bg-[#F1EEE8]" />
        </>
      )}
    </div>
  );
}

export default function Loading() {
  return (
    <PageLayout>
      <div aria-busy aria-label="Loading ledger generator">
        <span className="inline-flex items-center rounded-full border border-[#F3CFC3] bg-[#FCEDE8] px-[11px] py-[5px] font-mono text-[10px] leading-none font-medium tracking-[0.12em] text-[#B0442A] uppercase">
          Pro tools
        </span>
        <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-[10px] md:text-[27px]">
          Generate ledger
        </h1>
        <div aria-hidden className="mt-3 flex animate-pulse flex-col gap-[7px]">
          <span className="h-[11px] w-full max-w-[420px] rounded-[4px] bg-[#F1EEE8]" />
          <span className="h-[11px] w-[60%] max-w-[260px] rounded-[4px] bg-[#F1EEE8]" />
        </div>

        <div
          aria-hidden
          className="mt-5 grid animate-pulse grid-cols-1 gap-[14px] rounded-[12px] border border-[#E3DFD7] bg-white p-[18px] md:grid-cols-3"
        >
          {["w-14", "w-[70px]", "w-14"].map((labelWidth, index) => (
            <div key={index}>
              <span
                className={`mb-[7px] block h-[11px] rounded-[3px] bg-[#F1EEE8] ${labelWidth}`}
              />
              <span className="block h-[42px] rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7]" />
            </div>
          ))}
        </div>

        <div className="mt-[14px] grid grid-cols-1 gap-[14px] md:grid-cols-2 lg:grid-cols-3">
          <SkeletonCard withRows={false} />
          <SkeletonCard withRows />
          <SkeletonCard withRows />
        </div>

        <div
          aria-hidden
          className="mt-[14px] flex animate-pulse items-center gap-[11px] rounded-[12px] border border-[#E3DFD7] bg-[#FBFAF7] px-4 py-[14px]"
        >
          <span className="h-[6px] w-[6px] flex-none rounded-full bg-[#E3DFD7]" />
          <span className="h-[11px] w-[64%] rounded-[4px] bg-[#F1EEE8]" />
        </div>
      </div>
    </PageLayout>
  );
}
