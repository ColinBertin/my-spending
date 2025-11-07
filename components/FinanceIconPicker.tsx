import { financeIcons } from "@/helpers";
import { useState } from "react";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BiIcons from "react-icons/bi";
import type { FC } from "react";

interface FinanceIconPickerProps {
  onSelect: (icon: { pack: string; name: string }) => void;
}

export const FinanceIconPicker: FC<FinanceIconPickerProps> = ({
  onSelect,
  ...rest
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const iconPacks: Record<
    string,
    Record<string, FC<{ className?: string }>>
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
    <div className="grid grid-cols-5 md:grid-cols-8 lg:grid-cols-12 gap-4 p-4">
      {Object.entries(financeIcons).map(([pack, icons]) =>
        icons.map((iconName) => {
          const IconSet = iconPacks[pack];
          const IconComponent = IconSet[iconName as keyof typeof IconSet];

          if (!IconComponent) return null;

          const isSelected = selected === `${pack}-${iconName}`;

          return (
            <button
              key={`${pack}-${iconName}`}
              onClick={(e) => {
                e.preventDefault();
                handleSelect(pack, iconName);
              }}
              {...rest}
              className={`flex flex-col items-center p-2 border rounded-full transition-colors
                hover:bg-orange-100 ${isSelected ? "bg-orange-200" : ""}`}
            >
              <IconComponent className="w-6 h-6 text-gray-700" />
            </button>
          );
        }),
      )}
    </div>
  );
};
