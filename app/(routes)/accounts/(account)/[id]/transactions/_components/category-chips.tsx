import Link from "next/link";
import type { UseFormRegister } from "react-hook-form";
import type { Category, Transaction } from "@/types";
import { FieldError, FieldLegend } from "@/components/ui/Field";
import Radio from "@/components/ui/Radio";

type CategoryChipsProps = {
  register: UseFormRegister<Transaction>;
  categories: Category[];
  error?: string;
  className?: string;
};

export default function CategoryChips({
  register,
  categories,
  error,
  className,
}: CategoryChipsProps) {
  return (
    <fieldset className={className}>
      <FieldLegend>Category</FieldLegend>
      {categories.length === 0 ? (
        <p className="text-xs leading-relaxed text-ink-subtle">
          No categories for this account type yet.{" "}
          <Link href="/categories/create">Create one</Link> first.
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.75">
          {categories.map((category) => (
            <label
              key={category.id}
              className="group flex h-10 cursor-pointer items-center gap-1.75 rounded-pill border border-hairline bg-surface-field px-3 text-xs font-medium text-ink-body has-checked:border-ink has-checked:bg-ink has-checked:text-surface-app has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-ink sm:h-8.5"
            >
              <Radio
                value={category.id}
                {...register("category_id", {
                  required: "Category is required",
                })}
              />
              <span className="size-1.75 rounded-xs bg-graphic-grey group-has-checked:bg-brand" />
              {category.name}
            </label>
          ))}
        </div>
      )}
      <FieldError message={error} />
    </fieldset>
  );
}
