import { financeIcons } from "@/helpers";
import { useState } from "react";
import * as HiIcons from "react-icons/hi";
import type { FC } from "react";

interface FinanceIconPickerProps {
  onSelect: (iconName: string) => void;
}

export const FinanceIconPicker: FC<FinanceIconPickerProps> = ({
  onSelect,
  ...rest
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (iconName: string) => {
    setSelected(iconName);
    onSelect(iconName);
  };

  return (
    <div className="grid grid-cols-5 gap-4 p-4">
      {financeIcons.map((iconName) => {
        const IconComponent = HiIcons[iconName as keyof typeof HiIcons] as FC<{
          className?: string;
        }>;
        if (!IconComponent) return null;

        return (
          <button
            key={iconName}
            onClick={(e) => {
              e.preventDefault();
              handleSelect(iconName);
            }}
            className={`flex flex-col items-center p-2 border rounded hover:bg-orange-light ${
              selected === iconName ? "bg-orange-light" : ""
            }`}
            {...rest}
          >
            <IconComponent className="w-6 h-6 text-gray-700" />
          </button>
        );
      })}
    </div>
  );
};
