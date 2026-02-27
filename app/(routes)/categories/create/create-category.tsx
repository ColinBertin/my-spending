"use client";

import { Category } from "../../../../types";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import Loading from "./loading";
import Button from "../../../../components/Button";
import { FinanceIconPicker } from "../../../../components/FinanceIconPicker";
import ColorPicker from "../../../../components/ColorPicker";
import { colorCodes } from "../../../../helpers";
import Label from "../../../../components/Label";
import { useState, useTransition } from "react";
import Select from "../../../../components/Select";
import {
  useErrorNotification,
  useSuccessNotification,
} from "../../../../components/ui/NotificationProvider";

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
  } = useForm<Category>({ mode: "onChange" });

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
      showErrorNotification("Failed to create account");
      console.error(json.error);
      return;
    }

    startTransition(() => {
      router.push("/");
    });
    showSuccessNotification("Category created !");
  };

  const color = useWatch({
    control,
    name: "color",
  });

  if (isMutating) {
    return <Loading />;
  }

  return (
    <div className="w-full px-4 sm:px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-5xl flex justify-center">
        <form
          className="w-full max-w-2xl rounded-2xl border border-blue-dark/20 bg-white p-5 sm:p-6 shadow-sm flex flex-col items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-3xl font-semibold text-center text-red mb-8">
            New Category
          </h1>

          <div className="relative w-full max-w-md mb-6">
            <input
              type="text"
              placeholder="Name"
              className="border border-gray-500 rounded-xl w-full h-10 px-3 text-gray-700 font-medium focus:border-purple-300"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && (
              <small className="absolute top-11 left-2 text-red-300">
                {errors.name.message}
              </small>
            )}
          </div>
          <div className="relative">
            <Select
              defaultValue={"normal"}
              options={[
                { id: "normal", name: "Normal" },
                { id: "professional", name: "Professional" },
              ]}
              {...register("type", { required: "Type is required" })}
            />
          </div>

          <div className="relative w-full flex flex-col items-center px-2 mb-6">
            <Label text="Color" htmlFor="color" />
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <ColorPicker
                  value={field.value as string}
                  onChange={field.onChange}
                  colors={colorCodes}
                />
              )}
            />
          </div>

          <div className="relative w-full flex justify-center mb-6">
            <FinanceIconPicker
              color={color}
              onSelect={(icon) => {
                setValue("icon", icon.name);
                setValue("icon_pack", icon.pack);
              }}
              {...register("icon", { required: "Icon is required" })}
            />
            {errors.icon && (
              <small className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-red-300">
                {errors.icon.message}
              </small>
            )}
          </div>

          <div className="w-full max-w-md flex flex-col sm:flex-row justify-center gap-2">
            <Button
              type="button"
              text="Cancel"
              handleChange={() => router.back()}
            />
            <Button type="submit" text="Add" color="primary" />
          </div>
        </form>
      </div>
    </div>
  );
}
