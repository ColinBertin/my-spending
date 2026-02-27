import { colorCodes } from "../helpers";

type ColorPickerProps = {
  value: string;
  onChange: (...event: unknown[]) => void;
  colors: typeof colorCodes;
};

export default function ColorPicker({
  value,
  onChange,
  colors,
}: ColorPickerProps) {
  return (
    <div className="flex h-40 flex-wrap justify-center gap-2 overflow-scroll rounded-xl border bg-white py-1">
      {Object.entries(colors).map(([code, hex]) => (
        <div
          key={code}
          className={`inline-flex items-center justify-center rounded-full border-2 p-0.5 transition ${
            value === code
              ? "border-black shadow-[0_0_0_2px_rgba(0,0,0,0.12)]"
              : "border-transparent"
          }`}
        >
          <button
            type="button"
            onClick={() => onChange(code)}
            className="h-5 w-5 cursor-pointer rounded-full"
            aria-label={`Select ${code}`}
            title={code}
            style={{ backgroundColor: hex as string }}
          />
        </div>
      ))}
    </div>
  );
}
