import { colorCodes, financeIcons } from "../helpers";
import { useMemo, useState } from "react";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BiIcons from "react-icons/bi";
import type { FC } from "react";

interface FinanceIconPickerProps {
  color?: string;
  onSelect: (icon: { pack: string; name: string }) => void;
}

export const FinanceIconPicker: FC<FinanceIconPickerProps> = ({
  color,
  onSelect,
  ...rest
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  useMemo(() => {
    if (color) {
      console.log("Selected color:", color);
    }
  }, [color]);

  const iconPacks: Record<
    string,
    Record<string, FC<React.SVGProps<SVGSVGElement>>>
  > = {
    hi: HiIcons,
    fa: FaIcons,
    md: MdIcons,
    bi: BiIcons,
  };

  const handleSelect = (pack: string, name: string) => {
    setSelected(`${pack}-${name}`);
    onSelect({ pack, name });
  };

  return (
    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-4 p-4 h-80 overflow-y-auto border rounded-xl bg-white">
      {Object.entries(financeIcons).map(([pack, icons]) =>
        icons.map((iconName) => {
          const IconSet = iconPacks[pack];
          const IconComponent = IconSet[iconName as keyof typeof IconSet];
          if (!IconComponent) return null;

          const isSelected = selected === `${pack}-${iconName}`;

          return (
            <button
              type="button"
              key={`${pack}-${iconName}`}
              onClick={(e) => {
                e.preventDefault();
                handleSelect(pack, iconName);
              }}
              {...rest}
              className={`flex items-center justify-center w-10 h-10 aspect-square border rounded-full transition-colors cursor-pointer
                hover:bg-orange-50 ${isSelected ? "bg-orange-100" : ""}`}
            >
              <IconComponent
                className="w-6 h-6"
                style={{
                  color:
                    colorCodes[color as keyof typeof colorCodes] ?? "#f97316",
                }}
              />
            </button>
          );
        }),
      )}
    </div>
  );
};
