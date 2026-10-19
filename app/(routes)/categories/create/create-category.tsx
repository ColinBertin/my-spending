"use client";

import clsx from "clsx";
import Link from "next/link";
import type { CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useState, useTransition } from "react";
import { Category } from "@/types";
import { colorCodes, financeIcons } from "@/helpers";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { darkenHex, resolveCategoryHex } from "../category-cards";
import CategoryTile, { getCategoryIcon } from "../category-tile";

const SCOPES: { id: NonNullable<Category["type"]>; name: string }[] = [
  { id: "normal", name: "Normal" },
  { id: "professional", name: "Professional" },
];

const COLOR_OPTIONS = Object.entries(colorCodes) as [string, string][];

const ICON_OPTIONS = Object.entries(financeIcons).flatMap(([pack, names]) =>
  names.flatMap((name) => {
    const Icon = getCategoryIcon(pack, name);
    return Icon ? [{ pack, name, Icon }] : [];
  }),
);

const groupLabelClassName =
  "mb-3 block text-[11px] leading-none font-medium text-[#6B6760]";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <div className="mt-2 flex items-center gap-[7px]" role="alert">
      <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#B0442A]" />
      <span className="text-[11.5px] leading-[1.4] text-[#9E3B21]">
        {message}
      </span>
    </div>
  );
}

export default function CreateCategory() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Category>({
    mode: "onChange",
    defaultValues: { type: "normal" },
  });

  const name = useWatch({ control, name: "name" });
  const color = useWatch({ control, name: "color" });
  const icon = useWatch({ control, name: "icon" });
  const iconPack = useWatch({ control, name: "icon_pack" });

  const hex = resolveCategoryHex(color);
  const previewName = name?.trim() || "Category name";

  const onSubmit = async (values: Category) => {
    setIsFetching(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = await res.json().catch(() => ({}));

    setIsFetching(false);

    if (!res.ok) {
      showErrorNotification("Failed to create category");
      console.error(json.error);
      return;
    }

    startTransition(() => {
      router.push("/categories");
    });
    showSuccessNotification("Category created !");
  };

  return (
    <PageLayout>
      <div>
        <Link
          href="/categories"
          className="text-[12px] leading-none font-medium text-[#5C5952] hover:text-[#17161A] md:hidden"
        >
          ← Categories
        </Link>
        <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
          New category
        </h1>
        <p className="mt-[7px] max-w-[52ch] text-[13px] leading-[1.6] text-[#6B6760]">
          Colour and icon are what make the charts and the ledger readable later
          — pick them now, not after fifty entries.
        </p>

        <form
          className="mt-[18px] rounded-[12px] border border-[#E3DFD7] bg-white px-5 pt-[22px] pb-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div className="flex items-center gap-[13px] rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] px-[15px] py-[13px]">
            <CategoryTile
              hex={hex}
              icon={icon}
              iconPack={iconPack}
              name={previewName}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div
                className={clsx(
                  "truncate text-[13px] leading-[1.2] font-semibold",
                  !name?.trim() && "text-[#6B6760]",
                )}
              >
                {previewName}
              </div>
              <div className="mt-[5px] font-mono text-[10px] leading-[1.2] text-[#5C5952]">
                PREVIEW · AS IT WILL APPEAR IN ROWS
              </div>
            </div>
            <span className="hidden max-w-[40%] truncate rounded-[6px] bg-[#F4F1EA] px-2 py-[5px] font-mono text-[10px] leading-none font-medium tracking-[0.06em] text-[#5C5952] sm:inline">
              {previewName.toUpperCase()}
            </span>
          </div>

          <label
            htmlFor="category-name"
            className={clsx(groupLabelClassName, "mt-8")}
          >
            Name
          </label>
          <input
            id="category-name"
            type="text"
            aria-invalid={Boolean(errors.name)}
            className={clsx(
              "h-11 w-full rounded-[9px] border bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] outline-none focus:border-[1.5px] focus:bg-white",
              errors.name
                ? "border-[1.5px] border-[#B0442A] bg-white"
                : "border-[#E3DFD7] focus:border-[#17161A]",
            )}
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length > 0 || "Name is required",
            })}
          />
          <FieldError message={errors.name?.message} />

          <fieldset className="mt-8">
            <legend className={groupLabelClassName}>Scope</legend>
            <div className="flex">
              {SCOPES.map((scope, index) => (
                <label
                  key={scope.id}
                  className={clsx(
                    "flex h-11 cursor-pointer items-center border border-[#E3DFD7] bg-[#FBFAF7] px-[15px] text-[12.5px] leading-none font-medium text-[#6B6760] has-checked:border-[#17161A] has-checked:bg-[#17161A] has-checked:text-[#F7F5F1] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#17161A] sm:h-10",
                    index === 0 ? "rounded-l-[9px]" : "-ml-px rounded-r-[9px]",
                  )}
                >
                  <input
                    type="radio"
                    value={scope.id}
                    className="sr-only"
                    {...register("type", { required: "Scope is required" })}
                  />
                  {scope.name}
                </label>
              ))}
            </div>
            <p className="mt-2 text-[11.5px] leading-[1.5] text-[#6B6760]">
              Professional categories are the ones available to 元帳 exports.
            </p>
          </fieldset>

          <fieldset className="mt-8">
            <legend className={groupLabelClassName}>Colour</legend>
            <div className="relative flex max-h-[184px] flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] p-3 sm:max-h-[172px]">
              {COLOR_OPTIONS.map(([code, swatch]) => (
                <label
                  key={code}
                  title={code}
                  className="h-[38px] w-[38px] flex-none cursor-pointer rounded-[9px] has-checked:shadow-[inset_0_0_0_2px_#fff,0_0_0_2px_#17161A] has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-[#17161A] sm:h-[34px] sm:w-[34px]"
                  style={{ backgroundColor: swatch }}
                >
                  <input
                    type="radio"
                    value={code}
                    aria-label={code}
                    className="sr-only"
                    {...register("color")}
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className={groupLabelClassName}>Icon</legend>
            <Controller
              name="icon"
              control={control}
              rules={{ required: "Pick an icon" }}
              render={({ field }) => (
                <div
                  className="relative flex max-h-[200px] flex-wrap gap-2 overflow-y-auto overscroll-contain rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] p-3 sm:max-h-[184px]"
                  style={
                    { "--category-accent": darkenHex(hex) } as CSSProperties
                  }
                >
                  {ICON_OPTIONS.map(({ pack, name: iconName, Icon }) => (
                    <label
                      key={`${pack}-${iconName}`}
                      title={iconName}
                      className="flex h-11 w-11 flex-none cursor-pointer items-center justify-center rounded-[9px] border border-[#E3DFD7] bg-white text-[#5C5952] has-checked:border-[1.5px] has-checked:border-[#17161A] has-checked:bg-white has-checked:text-(--category-accent) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#17161A] sm:h-10 sm:w-10"
                    >
                      <input
                        type="radio"
                        name={field.name}
                        value={iconName}
                        aria-label={iconName}
                        className="sr-only"
                        checked={field.value === iconName}
                        onBlur={field.onBlur}
                        onChange={() => {
                          setValue("icon_pack", pack);
                          field.onChange(iconName);
                        }}
                      />
                      <Icon className="h-[19px] w-[19px]" aria-hidden />
                    </label>
                  ))}
                </div>
              )}
            />
            <FieldError message={errors.icon?.message} />
          </fieldset>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              disabled={isMutating}
              className="sm:min-w-[200px]"
            >
              {isMutating ? "Saving…" : "Save category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isMutating}
              className="sm:min-w-[160px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
