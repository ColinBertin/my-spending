import { colorCodes } from "@/helpers";

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
    <div className="flex flex-wrap gap-3 flex justify-center">
      {Object.entries(colors).map(([code, hex]) => (
        <div
          key={code}
          className={`inline-flex items-center justify-center rounded-full border p-0.5 ${
            value === code ? "border-2 border-black" : "border-transparent"
          }
          `}
        >
          <button
            type="button"
            onClick={() => onChange(code)}
            className="w-5 h-5 rounded-full cursor-pointer"
            style={{ backgroundColor: hex as string }}
          />
        </div>
      ))}
    </div>
  );
}
