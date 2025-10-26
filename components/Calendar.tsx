"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
}

export default function Calendar({ value, onChange }: CalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [selectedTime, setSelectedTime] = useState("12:00");

  // Keep combined datetime in sync
  useEffect(() => {
    if (selectedDate && onChange) {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const d = new Date(selectedDate);
      d.setHours(hours, minutes, 0, 0);
      onChange(d);
    }
  }, [onChange, selectedDate, selectedTime]);

  return (
    <div className="border rounded-xl border-gray-300 p-3 w-fit bg-white shadow-sm">
      <DayPicker
        mode="single"
        disabled={{ after: new Date() }}
        selected={selectedDate}
        onSelect={setSelectedDate}
        showOutsideDays
        className="text-xs [&_.rdp-day]:h-7 [&_.rdp-day]:w-7 [&_.rdp-day]:p-0 [&_.rdp-head_cell]:px-1 [&_.rdp-head_cell]:py-0 [&_.rdp-caption_label]:text-sm [&_.rdp-nav_button]:scale-90"
        styles={{
          caption: { fontSize: "0.8rem", marginBottom: "0.25rem" },
          head_cell: { fontSize: "0.7rem", padding: "0 2px" },
          day: { margin: "0", padding: "0", fontSize: "0.75rem" },
          month_caption: { marginBottom: "0.25rem" },
        }}
      />

      {/* Time selector */}
      <div className="flex items-center justify-between mt-2">
        <label htmlFor="time" className="text-xs text-gray-600 mr-2">
          Time:
        </label>
        <input
          id="time"
          type="time"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          className="border rounded-md px-2 py-1 text-sm w-28"
        />
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-600 mt-2">
        {selectedDate
          ? `Selected: ${selectedDate.toLocaleDateString()} ${selectedTime}`
          : "Pick a date and time."}
      </p>
    </div>
  );
}
