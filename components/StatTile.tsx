import clsx from "clsx";

type StatTileProps = {
  label: string;
  value: string | number;
  valueClassName?: string;
  size?: "md" | "sm";
};

export default function StatTile({
  label,
  value,
  valueClassName,
  size = "md",
}: StatTileProps) {
  return (
    <div
      className={clsx(
        "bg-white",
        size === "sm" ? "px-4 py-[13px]" : "px-[18px] py-4",
      )}
    >
      <div className="h-[10px] text-[10px] leading-[10px] font-medium tracking-[0.14em] text-[#5C5952] uppercase">
        {label}
      </div>
      <div
        className={clsx(
          "font-mono font-semibold tabular-nums whitespace-nowrap",
          size === "sm"
            ? "mt-2 h-[22px] text-[20px] leading-[22px]"
            : "mt-[10px] h-[25px] text-[25px] leading-[25px] tracking-[-0.02em] sm:h-[30px] sm:text-[30px] sm:leading-[30px]",
          valueClassName ?? "text-[#17161A]",
        )}
      >
        {value}
      </div>
    </div>
  );
}
