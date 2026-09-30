"use client";

import { useState } from "react";

type MonthStepperProps = {
  initialDate?: Date;
  onChange?: (date: Date) => void;
};

export default function MonthStepper({
  initialDate,
  onChange,
}: MonthStepperProps) {
  const [date, setDate] = useState(initialDate ?? new Date());

  const label = date
    .toLocaleString("default", { month: "short", year: "numeric" })
    .toUpperCase();

  const step = (delta: number) => {
    const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
    setDate(next);
    onChange?.(next);
  };

  return (
    <div className="flex items-center gap-[2px] rounded-[9px] border border-[#E3DFD7] bg-white p-[3px]">
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Previous month"
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] text-[13px] font-medium text-[#6B6760] hover:bg-[#F7F5F1]"
      >
        ‹
      </button>
      <span className="px-2 font-mono text-[12px] font-medium whitespace-nowrap">
        {label}
      </span>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Next month"
        className="flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[7px] text-[13px] font-medium text-[#6B6760] hover:bg-[#F7F5F1]"
      >
        ›
      </button>
    </div>
  );
}
