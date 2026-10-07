"use client";

import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { CategoryCard, CategoryScope } from "./category-cards";
import CategoryTile from "./category-tile";

type CategoriesListProps = {
  cards: CategoryCard[];
  meta: string;
};

const SCOPES: { id: CategoryScope; label: string }[] = [
  { id: "normal", label: "Normal" },
  { id: "professional", label: "Professional" },
];

export default function CategoriesList({ cards, meta }: CategoriesListProps) {
  const [scope, setScope] = useState<CategoryScope>("normal");

  const visibleCards = cards.filter((card) => card.scope === scope);

  return (
    <PageLayout>
      <div>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-[14px]">
          <div>
            <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
              Categories
            </h1>
            <p className="mt-[6px] text-[13px] leading-[1.5] text-[#6B6760]">
              {meta}
            </p>
          </div>
          <div className="flex gap-2">
            <div
              role="group"
              aria-label="Category scope"
              className="flex gap-[2px] rounded-[9px] border border-[#E3DFD7] bg-white p-[3px]"
            >
              {SCOPES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  aria-pressed={scope === option.id}
                  onClick={() => setScope(option.id)}
                  className={clsx(
                    "h-[34px] cursor-pointer rounded-[7px] px-3 text-[12px] leading-none font-medium transition-colors md:h-[30px]",
                    scope === option.id
                      ? "bg-[#17161A] text-[#F7F5F1]"
                      : "bg-transparent text-[#6B6760] hover:text-[#17161A]",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <Button
              asChild
              className="h-[42px] rounded-[9px] px-[15px] text-[13px] md:h-[38px]"
            >
              <Link href="/categories/create">New category</Link>
            </Button>
          </div>
        </div>

        {visibleCards.length === 0 && (
          <div className="mb-4">
            <p className="text-[13px] leading-[1.3] font-semibold">
              No {scope} categories yet
            </p>
            <p className="mt-[6px] max-w-[52ch] text-[12px] leading-[1.6] text-[#6B6760]">
              {scope === "professional"
                ? "Professional categories are the ones that show up in 元帳 exports."
                : "Give each one a colour so charts and ledgers stay readable."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {visibleCards.map((card) => (
            <article
              key={card.id}
              className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-[#E3DFD7] bg-white px-[15px] py-[14px]"
            >
              <div className="flex min-w-0 items-center gap-[10px]">
                <CategoryTile
                  hex={card.hex}
                  icon={card.icon}
                  iconPack={card.iconPack}
                  name={card.name}
                />
                <div className="min-w-0">
                  <h2 className="truncate text-[13px] leading-[1.2] font-medium">
                    {card.name}
                  </h2>
                  <p className="mt-1 truncate font-mono text-[10px] leading-[1.2] text-[#5C5952]">
                    {card.usageLabel}
                  </p>
                </div>
              </div>
              <p
                className={clsx(
                  "font-mono text-[15px] leading-none font-medium tabular-nums",
                  card.entries === 0 && "text-[#6B6760]",
                )}
              >
                {card.total}
              </p>
              <div className="h-1 overflow-hidden rounded-[2px] bg-[#F1EEE8]">
                <div
                  className="h-full rounded-[2px]"
                  style={{
                    width: `${card.barPercent.toFixed(1)}%`,
                    backgroundColor: card.hex,
                  }}
                />
              </div>
            </article>
          ))}

          <Link
            href="/categories/create"
            className="group flex min-h-[112px] flex-col items-center justify-center gap-[9px] rounded-[12px] border-[1.5px] border-dashed border-[#C9C3B7] bg-[#FBFAF7] px-[15px] py-[14px] text-[#5C5952] transition-colors hover:border-[#17161A] hover:text-[#17161A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17161A]"
          >
            <span
              aria-hidden
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-white text-[17px] leading-none"
            >
              +
            </span>
            <span className="text-[12px] leading-none font-medium">
              Add category
            </span>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
