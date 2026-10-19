export default function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-[13px] leading-[1.4]">
      <span className="text-[11px] leading-[1.6] font-medium text-[#6B6760]">
        {label}
      </span>
      <span className="break-all text-[#17161A]">{value}</span>
    </div>
  );
}
