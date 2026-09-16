import { CategoryTotal } from "@/types";
import { formatCurrencyIntoYen } from "@/helpers";
import DashboardCard from "@/components/DashboardCard";
import CategoryRowSkeleton from "@/components/CategoryRowSkeleton";

type CategoryBreakdownCardProps = {
  categories: CategoryTotal[];
  isLoading: boolean;
};

export default function CategoryBreakdownCard({
  categories,
  isLoading,
}: CategoryBreakdownCardProps) {
  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  return (
    <DashboardCard
      title="Where it went"
      bodyClassName="flex flex-col gap-3 overflow-x-auto px-[18px] pt-[14px] pb-4"
    >
      {isLoading ? (
        Array.from({ length: 6 }, (_, i) => <CategoryRowSkeleton key={i} />)
      ) : expenseCategories.length === 0 ? (
        <p className="py-6 text-center text-[13px] text-[#6B6760]">
          No entries for this period.
        </p>
      ) : (
        expenseCategories.map((category) => (
          <div key={category.category}>
            <div className="mb-[6px] flex justify-between gap-[10px] text-[12px] font-medium">
              <span>{category.category}</span>
              <span className="font-mono tabular-nums text-[#3B3934]">
                {formatCurrencyIntoYen(category.total)}
              </span>
            </div>
            <div className="h-[6px] overflow-hidden rounded-[3px] bg-[#F1EEE8]">
              <div
                className="h-full rounded-[3px]"
                style={{
                  width: `${category.percentage ?? 0}%`,
                  backgroundColor:
                    (category.percentage ?? 0) > 60 ? "#17161A" : "#E8552F",
                }}
              />
            </div>
          </div>
        ))
      )}
    </DashboardCard>
  );
}
