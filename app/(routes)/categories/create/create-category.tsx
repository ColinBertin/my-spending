"use client";

import { Category } from "@/types";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import Loading from "./loading";
import Button from "@/components/Button";
import { FinanceIconPicker } from "@/components/FinanceIconPicker";
import ColorPicker from "@/components/ColorPicker";
import { colorCodes } from "@/helpers";
import Label from "@/components/Label";
import { useState, useTransition } from "react";

export default function CreateCategory() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

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

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to create account");
    }
    setIsFetching(false);
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  const color = useWatch({
    control,
    name: "color",
  });

  if (isMutating) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-full w-full mt-24">
      <form
        className="flex flex-col justify-center items-center md:w-1/2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          New Category
        </h1>
        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-500 rounded-xl w-full sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.name.message}
            </small>
          )}
        </div>
        {/* <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Color"
            className="border border-gray-500 rounded-xl w-full sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("color", { required: "Color is required" })}
          />
          {errors.color && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.color.message}
            </small>
          )}
        </div> */}
        <div className="relative flex flex-col justify-around items-center px-2 mb-4 w-full">
          <Label text="Color" htmlFor="color" />
          <Controller
            name="color"
            control={control}
            render={({ field }) => (
              <ColorPicker
                value={field.value}
                onChange={field.onChange}
                colors={colorCodes}
              />
            )}
          />
        </div>
        <div className="relative mb-8">
          <FinanceIconPicker
            color={color}
            onSelect={(icon) => {
              setValue("icon", icon.name);
              setValue("icon_pack", icon.pack);
            }}
            {...register("icon", { required: "Icon is required" })}
          />
          {errors.icon && (
            <small className="absolute -bottom-4 left-2 text-red-300">
              {errors.icon.message}
            </small>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <Button
            type="button"
            text="Cancel"
            handleChange={() => router.back()}
          />
          <Button type="submit" text="Add" color="primary" />
        </div>
      </form>
    </div>
  );
}
