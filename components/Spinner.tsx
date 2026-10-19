import clsx from "clsx";

const TICK_COUNT = 12;

type SpinnerProps = {
  className?: string;
};

export default function Spinner({ className }: SpinnerProps) {
  return (
    <span
      className={clsx("relative inline-block h-12 w-12", className)}
      role="status"
    >
      {Array.from({ length: TICK_COUNT }, (_, i) => (
        <span
          key={i}
          className="absolute top-1/2 left-1/2 h-[11px] w-[3px] rounded-full bg-current motion-reduce:animate-none"
          style={{
            transform: `translate(-50%, -50%) rotate(${i * 30}deg) translateY(-17px)`,
            animation: "spinner-tick-fade 1s linear infinite",
            animationDelay: `${(i - TICK_COUNT) / TICK_COUNT}s`,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </span>
  );
}
