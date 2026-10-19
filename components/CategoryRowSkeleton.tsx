export default function CategoryRowSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-[6px] flex items-center justify-between gap-[10px]">
        <div className="h-[12px] w-24 rounded-[2px] bg-[#F1EEE8]" />
        <div className="h-[12px] w-14 rounded-[2px] bg-[#F1EEE8]" />
      </div>
      <div className="h-[6px] overflow-hidden rounded-[3px] bg-[#F1EEE8]" />
    </div>
  );
}
