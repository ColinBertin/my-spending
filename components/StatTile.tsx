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
      <div className="text-[10px] font-medium tracking-[0.14em] text-[#5C5952] uppercase">
        {label}
      </div>
      <div
        className={clsx(
          "mt-[10px] font-mono text-[25px] font-semibold tracking-[-0.02em] tabular-nums whitespace-nowrap sm:text-[30px]",
          valueClassName ?? "text-[#17161A]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
