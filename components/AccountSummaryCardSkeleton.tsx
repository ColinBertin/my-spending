export default function AccountSummaryCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white">
      <div className="flex items-start justify-between gap-[10px] border-b border-[#E3DFD7] px-[18px] pt-[22px] pb-[20px]">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-[15px] w-28 rounded-[2px] bg-[#F1EEE8]" />
            <div className="h-[17px] w-16 rounded-[5px] bg-[#F1EEE8]" />
          </div>
          <div className="mt-[7px] h-[11px] w-24 rounded-[2px] bg-[#F1EEE8]" />
        </div>
        <div className="h-[30px] w-16 rounded-[8px] bg-[#F1EEE8]" />
      </div>
      <div className="px-[18px] pt-[22px] pb-[24px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="h-[10px] w-14 rounded-[2px] bg-[#F1EEE8]" />
            <div className="mt-2 h-[26px] w-28 rounded-[4px] bg-[#F1EEE8]" />
          </div>
          <div className="flex flex-col items-end gap-[6px]">
            <div className="h-[12px] w-16 rounded-[2px] bg-[#F1EEE8]" />
            <div className="h-[12px] w-16 rounded-[2px] bg-[#F1EEE8]" />
          </div>
        </div>
        <div className="mt-[14px] h-2 rounded-[4px] bg-[#F1EEE8]" />
        <div className="mt-[7px] flex justify-between">
          <div className="h-[10px] w-20 rounded-[2px] bg-[#F1EEE8]" />
          <div className="h-[10px] w-20 rounded-[2px] bg-[#F1EEE8]" />
        </div>
      </div>
    </div>
  );
}
