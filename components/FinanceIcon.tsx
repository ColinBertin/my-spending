import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BiIcons from "react-icons/bi";
import type { FC } from "react";

interface FinanceIconProps {
  icon: string;
  iconPack: string;
  className?: string;
}

export const FinanceIcon: FC<FinanceIconProps> = ({
  icon,
  iconPack,
  className = "w-8 h-8 py-1 border rounded-full text-orange-dark",
}) => {
  const iconSets: Record<string, Record<string, FC<{ className?: string }>>> = {
    hi: HiIcons,
    fa: FaIcons,
    md: MdIcons,
    bi: BiIcons,
  };

  const IconSet = iconSets[iconPack];
  const IconComponent = IconSet?.[icon as keyof typeof IconSet];

  if (!IconComponent) return null;

  return <IconComponent className={className} />;
};
