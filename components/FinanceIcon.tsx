import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BiIcons from "react-icons/bi";
import * as LuIcons from "lucide-react";
import type { FC } from "react";
import { colorCodes } from "../helpers";

interface FinanceIconProps {
  icon: string;
  iconPack: string;
  iconColor: string;
  className?: string;
}

export const FinanceIcon: FC<FinanceIconProps> = ({
  icon,
  iconPack,
  iconColor,
  className = "w-8 h-8 p-1.5 border rounded-full text-orange-dark",
}) => {
  const iconSets: Record<
    string,
    Record<string, FC<React.SVGProps<SVGSVGElement>>>
  > = {
    hi: HiIcons,
    fa: FaIcons,
    md: MdIcons,
    bi: BiIcons,
    lucide: LuIcons as unknown as Record<
      string,
      FC<React.SVGProps<SVGSVGElement>>
    >,
    lu: LuIcons as unknown as Record<string, FC<React.SVGProps<SVGSVGElement>>>,
  };

  const IconSet = iconSets[iconPack];
  const IconComponent = IconSet?.[icon as keyof typeof IconSet];

  if (!IconComponent) return null;

  const colorFromPalette = colorCodes[iconColor as keyof typeof colorCodes];
  const resolvedColor =
    colorFromPalette ||
    (typeof iconColor === "string" && iconColor.trim().startsWith("#")
      ? iconColor
      : "#f97316");

  return (
    <IconComponent
      className={className}
      style={{
        color: resolvedColor,
      }}
    />
  );
};
