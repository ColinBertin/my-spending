import clsx from "clsx";
import type { FC, SVGProps } from "react";
import * as HiIcons from "react-icons/hi";
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as BiIcons from "react-icons/bi";
import { darkenHex } from "./category-cards";

type IconComponent = FC<SVGProps<SVGSVGElement>>;

const ICON_SETS: Record<string, Record<string, IconComponent>> = {
  hi: HiIcons as unknown as Record<string, IconComponent>,
  fa: FaIcons as unknown as Record<string, IconComponent>,
  md: MdIcons as unknown as Record<string, IconComponent>,
  bi: BiIcons as unknown as Record<string, IconComponent>,
};

export function getCategoryIcon(pack?: string, name?: string) {
  if (!pack || !name) {
    return undefined;
  }
  return ICON_SETS[pack]?.[name];
}

type CategoryTileProps = {
  hex: string;
  icon?: string;
  iconPack?: string;
  name: string;
  size?: "md" | "lg";
};

export default function CategoryTile({
  hex,
  icon,
  iconPack,
  name,
  size = "md",
}: CategoryTileProps) {
  const Icon = getCategoryIcon(iconPack, icon);

  return (
    <span
      aria-hidden
      className={clsx(
        "flex flex-none items-center justify-center rounded-[9px] text-[13px] leading-none font-semibold",
        size === "lg" ? "h-9 w-9" : "h-8 w-8",
      )}
      style={{ backgroundColor: `${hex}1F`, color: darkenHex(hex) }}
    >
      {Icon ? (
        <Icon
          className={size === "lg" ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]"}
        />
      ) : (
        (name.trim()[0]?.toUpperCase() ?? "")
      )}
    </span>
  );
}
