"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useState, useTransition } from "react";
import { Category } from "@/types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { FieldError } from "@/components/ui/Field";
import Label from "@/components/ui/Label";
import { resolveCategoryHex } from "./category-cards";
import CategoryPreview from "./_components/category-preview";
import ColorPicker from "./_components/color-picker";
import IconPicker from "./_components/icon-picker";
import ScopeToggle from "./_components/scope-toggle";

type CreateCategoryProps = { category: Category };

export default function CreateUpdateCategory({
  category,
}: CreateCategoryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const pathname = usePathname();
  const formType = pathname.endsWith("create") ? "create" : "update";

  const isMutating = isPending || isFetching;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Category>({
    mode: "onChange",
    defaultValues: category,
  });

  const name = useWatch({ control, name: "name" });
  const color = useWatch({ control, name: "color" });
  const icon = useWatch({ control, name: "icon" });
  const iconPack = useWatch({ control, name: "icon_pack" });

  const hex = resolveCategoryHex(color);

  const onSubmit = async (values: Category) => {
    setIsFetching(true);
    const res = await fetch("/api/categories", {
      method: formType === "create" ? "POST" : "PUT",
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
      <>
        <Link
          href="/categories"
          className="text-xs leading-none font-medium text-ink-muted hover:text-ink md:hidden"
        >
          ← Categories
        </Link>
        <h1 className="mt-2 text-2xl leading-tight font-semibold tracking-tight md:mt-0 md:text-3xl">
          {formType === "create" ? "New" : "Update"} category
        </h1>
        <p className="mt-1.75 max-w-md text-sm leading-relaxed text-ink-subtle">
          Colour and icon are what make the charts and the ledger readable later
          — pick them now, not after fifty entries.
        </p>

        <form
          className="mt-4.5 rounded-card border border-hairline bg-white px-5 pt-5.5 pb-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <CategoryPreview
            name={name}
            hex={hex}
            icon={icon}
            iconPack={iconPack}
          />

          <Label htmlFor="category-name" className="mt-8">
            Name
          </Label>
          <Input
            id="category-name"
            aria-invalid={Boolean(errors.name)}
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length > 0 || "Name is required",
            })}
          />
          <FieldError message={errors.name?.message} />

          <ScopeToggle
            register={register}
            error={errors.type?.message}
            className="mt-8"
          />
          <ColorPicker
            register={register}
            error={errors.color?.message}
            className="mt-8"
          />
          <IconPicker
            control={control}
            setValue={setValue}
            hex={hex}
            error={errors.icon?.message}
            className="mt-8"
          />

          <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              disabled={isMutating}
              className="sm:min-w-50"
            >
              {isMutating ? "Saving…" : "Save category"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isMutating}
              className="sm:min-w-40"
            >
              Cancel
            </Button>
          </div>
        </form>
      </>
    </PageLayout>
  );
}
