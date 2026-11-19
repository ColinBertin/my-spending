import clsx from "clsx";
import CategoryTile from "../category-tile";

type CategoryPreviewProps = {
  name?: string;
  hex: string;
  icon?: string;
  iconPack?: string;
};

export const PREVIEW_PLACEHOLDER = "Category name";

export default function CategoryPreview({
  name,
  hex,
  icon,
  iconPack,
}: CategoryPreviewProps) {
  const trimmed = name?.trim();
  const displayName = trimmed || PREVIEW_PLACEHOLDER;

  return (
    <div className="flex items-center gap-3.25 rounded-lg border border-hairline bg-surface-field px-3.75 py-3.25">
      <CategoryTile
        hex={hex}
        icon={icon}
        iconPack={iconPack}
        name={displayName}
        size="lg"
      />
      <div className="min-w-0 flex-1">
        <div
          className={clsx(
            "truncate text-sm leading-tight font-semibold",
            !trimmed && "text-ink-subtle",
          )}
        >
          {displayName}
        </div>
        <div className="mt-1.25 font-mono text-xs leading-tight text-ink-muted">
          PREVIEW · AS IT WILL APPEAR IN ROWS
        </div>
      </div>
      <span className="hidden max-w-2/5 truncate rounded-md bg-surface-head px-2 py-1.25 font-mono text-xs leading-none font-medium tracking-wider text-ink-muted sm:inline">
        {displayName.toUpperCase()}
      </span>
    </div>
  );
}
