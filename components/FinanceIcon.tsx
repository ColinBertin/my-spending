import * as HiIcons from "react-icons/hi";
import type { FC } from "react";

interface FinanceIconProps {
  icon: string;
}

export const FinanceIcon: FC<FinanceIconProps> = ({ icon }) => {
  const IconComponent = HiIcons[icon as keyof typeof HiIcons] as FC<{
    className?: string;
  }>;

  return (
    IconComponent && (
      <IconComponent className="w-8 h-8 py-1 border rounded-full text-orange-dark" />
    )
  );
};
