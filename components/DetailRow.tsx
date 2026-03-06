export default function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-3 text-sm">
      <span className="font-medium text-gray-500">{label}</span>
      <span className="text-gray-800 break-all">{value}</span>
    </div>
  );
}
