import clsx from "clsx";
import PageLayout from "@/components/layout/PageLayout";

const BLOCK = "rounded-sm bg-surface-rail";
const PICKER_BOX =
  "flex flex-wrap gap-2 overflow-hidden rounded-lg border border-hairline bg-surface-field p-3";

function LabelBar({ className }: { className: string }) {
  return <div className={clsx("mb-3 h-3", BLOCK, className)} />;
}

function PickerSkeleton({
  count,
  itemClassName,
  boxClassName,
}: {
  count: number;
  itemClassName: string;
  boxClassName: string;
}) {
  return (
    <div className="mt-8" aria-hidden>
      <LabelBar className="w-12" />
      <div className={clsx(PICKER_BOX, boxClassName)}>
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            className={clsx(
              "flex-none rounded-control bg-surface-rail",
              itemClassName,
            )}
          />
        ))}
      </div>
    </div>
  );
}

export default function CategoryFormSkeleton({
  mode,
}: {
  mode: "create" | "update";
}) {
  const title = mode === "create" ? "New category" : "Update category";

  return (
    <PageLayout>
      <div aria-busy aria-label={`Loading ${title.toLowerCase()} form`}>
        <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-tight md:mt-0 md:text-3xl">
          {title}
        </h1>
        <div
          aria-hidden
          className={clsx("mt-3 h-3.5 w-4/5 max-w-90 animate-pulse", BLOCK)}
        />

        <div className="mt-4.5 animate-pulse rounded-card border border-hairline bg-white px-5 pt-5.5 pb-6">
          {/* Preview */}
          <div
            aria-hidden
            className="flex items-center gap-3.25 rounded-lg border border-hairline bg-surface-field px-3.75 py-3.25"
          >
            <span className="size-9 flex-none rounded-control bg-surface-rail" />
            <span className="flex flex-1 flex-col gap-1.5">
              <span className={clsx("h-3.5 w-1/3", BLOCK)} />
              <span className={clsx("h-3 w-1/2", BLOCK)} />
            </span>
          </div>

          <div className="mt-8" aria-hidden>
            <LabelBar className="w-10" />
            <div className="h-11 rounded-control border border-hairline bg-surface-field" />
          </div>

          <div className="mt-8" aria-hidden>
            <LabelBar className="w-12" />
            <div className="h-11 w-55 rounded-control bg-surface-rail sm:h-10" />
            <div className={clsx("mt-2 h-3 w-3/5", BLOCK)} />
          </div>

          <PickerSkeleton
            count={14}
            itemClassName="size-9.5 sm:size-8.5"
            boxClassName="max-h-46 sm:max-h-43"
          />

          <PickerSkeleton
            count={14}
            itemClassName="size-11 sm:size-10"
            boxClassName="max-h-50 sm:max-h-46"
          />

          <div
            aria-hidden
            className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start"
          >
            <span className="h-control-full rounded-lg bg-surface-rail sm:w-50" />
            <span className="h-control-full rounded-lg border border-hairline bg-white sm:w-40" />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
