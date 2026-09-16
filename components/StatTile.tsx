import clsx from "clsx";

type StatTileProps = {
  label: string;
  value: string | number;
  valueClassName?: string;
};

export default function StatTile({
  label,
  value,
  valueClassName,
}: StatTileProps) {
  return (
    <div className="bg-white px-[18px] py-4">
      <div className="h-[10px] text-[10px] leading-[10px] font-medium tracking-[0.14em] text-[#5C5952] uppercase">
        {label}
      </div>
      <div
        className={clsx(
          "mt-[10px] h-[25px] font-mono text-[25px] leading-[25px] font-semibold tracking-[-0.02em] tabular-nums whitespace-nowrap sm:h-[30px] sm:text-[30px] sm:leading-[30px]",
          valueClassName ?? "text-[#17161A]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
