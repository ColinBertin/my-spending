"use client";

import PageHeader from "@/components/ui/PageHeader";
import PageLayout from "@/components/ui/PageLayout";
import { Category } from "@/types";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";

type CategoriesListProps = {
  categories: Category[];
};

export default function CategoriesList({ categories }: CategoriesListProps) {
  const [isNormalCategory, setIsNormalCategory] = useState(true);
  const [isProCategory, setIsProCategory] = useState(false);

  const normalCategories = categories.filter(
    (category) => category.type === "normal",
  );
  const professionalCategories = categories.filter(
    (category) => category.type === "professional",
  );

  return (
    <PageLayout>
      <>
        <div className="flex w-full justify-between">
          <PageHeader title="Categories" subTitle="" />
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-[2px] rounded-[9px] border border-[#E3DFD7] bg-white p-[3px]">
              <button
                onClick={() => {
                  setIsNormalCategory(true);
                  setIsProCategory(false);
                }}
                className={clsx(
                  "h-[30px] cursor-pointer rounded-[7px] px-3 text-[12px] font-medium transition-colors",
                  isNormalCategory
                    ? "bg-[#17161A] text-[#F7F5F1]"
                    : "bg-transparent text-[#6B6760]",
                )}
              >
                Normal
              </button>
              <button
                onClick={() => {
                  setIsNormalCategory(false);
                  setIsProCategory(true);
                }}
                className={clsx(
                  "h-[30px] cursor-pointer rounded-[7px] px-3 text-[12px] font-medium transition-colors",
                  isProCategory
                    ? "bg-[#17161A] text-[#F7F5F1]"
                    : "bg-transparent text-[#6B6760]",
                )}
              >
                Professional
              </button>
            </div>
            <Link
              href="/categories/create"
              className="inline-flex h-[42px] cursor-pointer items-center justify-center rounded-[9px] bg-[#B04124] px-[15px] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B] md:h-[38px]"
            >
              New category
            </Link>
          </div>
        </div>

        {isNormalCategory ? (
          <>
            <h2>Normal Cat.</h2>
            {normalCategories && (
              <ul>
                {normalCategories.map(({ id, name }) => (
                  <li key={id}>{name}</li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <>
            <h2 className="pt-12">Pro. Cat.</h2>
            {professionalCategories && (
              <ul>
                {professionalCategories.map(({ id, name }) => (
                  <li key={id}>{name}</li>
                ))}
              </ul>
            )}
          </>
        )}
      </>
    </PageLayout>
  );
}
