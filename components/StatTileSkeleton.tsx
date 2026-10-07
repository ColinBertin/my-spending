import clsx from "clsx";

export default function StatTileSkeleton({
  size = "md",
}: {
  size?: "md" | "sm";
}) {
  return (
    <div
      className={clsx(
        "animate-pulse bg-white",
        size === "sm" ? "px-4 py-[13px]" : "px-[18px] py-4",
      )}
    >
      <div className="h-[10px] w-16 rounded-[2px] bg-[#F1EEE8]" />
      <div
        className={clsx(
          "rounded-[4px] bg-[#F1EEE8]",
          size === "sm"
            ? "mt-2 h-[22px] w-20"
            : "mt-[10px] h-[25px] w-24 sm:h-[30px]",
        )}
      />
    </div>
  );
}
