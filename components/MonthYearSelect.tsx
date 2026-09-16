type MonthYearSelectProps = {
  value: string;
  onChange: (value: string) => void;
};

export default function MonthYearSelect({
  value,
  onChange,
}: MonthYearSelectProps) {
  const today = new Date();
  const options = Array.from({ length: 60 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      id: `${date.getFullYear()}-${date.getMonth() + 1}`,
      name: date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    };
  });

  return (
    <select
      className="h-[38px] cursor-pointer rounded-[9px] border border-[#E3DFD7] bg-white px-[15px] text-[13px] font-medium text-[#3B3934] focus:border-[#17161A] focus:outline-none"
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}
