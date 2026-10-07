import PageLayout from "@/components/layout/PageLayout";

const SKELETON_BLOCK = "rounded-[4px] bg-[#F1EEE8]";

function GroupSkeleton({ count, size }: { count: number; size: string }) {
  return (
    <div className="mt-8" aria-hidden>
      <div className={`mb-3 h-[11px] w-12 ${SKELETON_BLOCK}`} />
      <div className="flex flex-wrap gap-2 p-[3px]">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={`${size} flex-none rounded-[9px] bg-[#F1EEE8]`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <PageLayout>
      <div aria-busy aria-label="Loading new category form">
        <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
          New category
        </h1>
        <div
          aria-hidden
          className={`mt-[11px] h-[11px] w-[min(360px,80%)] animate-pulse ${SKELETON_BLOCK}`}
        />

        <div className="mt-[18px] animate-pulse rounded-[12px] border border-[#E3DFD7] bg-white px-5 pt-[22px] pb-6">
          <div
            aria-hidden
            className="flex items-center gap-[13px] rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] px-[15px] py-[13px]"
          >
            <span className="h-9 w-9 flex-none rounded-[9px] bg-[#F1EEE8]" />
            <span className="flex flex-1 flex-col gap-[6px]">
              <span className={`h-[11px] w-[34%] ${SKELETON_BLOCK}`} />
              <span className={`h-[9px] w-[52%] ${SKELETON_BLOCK}`} />
            </span>
          </div>

          <div className="mt-8" aria-hidden>
            <div className={`mb-3 h-[11px] w-10 ${SKELETON_BLOCK}`} />
            <div className="h-11 rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7]" />
          </div>

          <div className="mt-8" aria-hidden>
            <div className={`mb-3 h-[11px] w-12 ${SKELETON_BLOCK}`} />
            <div className="h-11 w-[220px] rounded-[9px] bg-[#F1EEE8] sm:h-10" />
          </div>

          <GroupSkeleton
            count={14}
            size="h-[38px] w-[38px] sm:h-[34px] sm:w-[34px]"
          />
          <GroupSkeleton count={14} size="h-11 w-11 sm:h-10 sm:w-10" />

          <div
            aria-hidden
            className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start"
          >
            <span className="h-[46px] rounded-[10px] bg-[#F1EEE8] sm:w-[200px]" />
            <span className="h-[46px] rounded-[10px] border border-[#E3DFD7] bg-white sm:w-[160px]" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
