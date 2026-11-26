"use client";

import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { useState, useTransition } from "react";
import { Category } from "@/types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageLayout from "@/components/layout/PageLayout";
import Input from "@/components/ui/Input";
import { resolveCategoryHex } from "./category-cards";
import CategoryPreview from "./_components/category-preview";
import ColorPicker from "./_components/color-picker";
import IconPicker from "./_components/icon-picker";
import ScopeToggle from "./_components/scope-toggle";
import PageHeader from "@/components/ui/PageHeader";
import FormFooter, { type ActionButton } from "@/components/ui/FormFooter";

type CreateUpdateCategoryProps = {
  mode: "create" | "update";
  category: Category;
};

export default function CreateUpdateCategory({
  mode,
  category,
}: CreateUpdateCategoryProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;

  const actionButtons: ActionButton[] = [
    {
      text: isMutating ? "Saving…" : "Save category",
      type: "submit",
      size: "lg",
      isMutating,
    },
    {
      text: "Cancel",
      type: "button",
      size: "lg",
      variant: "outline",
      isMutating,
      handleClick: () => router.back(),
      className: "sm:min-w-40",
    },
  ];
  // TODO: lift once ledgers match transactions by category_id.
  const isNameLocked = mode === "update" && category.type === "professional";

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

    const filledEntries = Object.entries(values).filter(
      ([, value]) => value !== null && value !== undefined && value !== "",
    );
    const payload = Object.fromEntries(filledEntries);

    const res = await fetch("/api/categories", {
      method: mode === "create" ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));

    setIsFetching(false);

    if (!res.ok) {
      showErrorNotification(`Failed to ${mode} category`);
      console.error(json.error);
      return;
    }

    startTransition(() => {
      router.push("/categories");
    });
    showSuccessNotification(
      `Category ${mode === "create" ? "created" : "updated"} !`,
    );
  };

  return (
    <PageLayout>
      <>
        <PageHeader
          href="/categories"
          linkText="Categories"
          title={`${mode === "create" ? "New" : "Update"} category`}
          subTitle="Colour and icon are what make the charts and the ledger readable later
          — pick them now, not after fifty entries."
        />
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

          <Input
            id="category-name"
            title="Name"
            containerClassName="mt-8"
            aria-invalid={Boolean(errors.name)}
            readOnly={isNameLocked}
            className={
              isNameLocked ? "cursor-not-allowed opacity-60" : undefined
            }
            subText={
              isNameLocked
                ? "Professional categories can't be renamed — ledgers match transactions by category name."
                : undefined
            }
            errorMessage={errors.name?.message}
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length > 0 || "Name is required",
            })}
          />

          <ScopeToggle
            register={register}
            error={errors.type?.message}
            disabled={mode === "update"}
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

          <FormFooter actionButtons={actionButtons} />
        </form>
      </>
    </PageLayout>
  );
}
