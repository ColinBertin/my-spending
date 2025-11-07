"use client";

import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { Category } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import Loading from "./loading";
import { createCategory } from "@/app/lib/createCategory";
import Button from "@/components/Button";
import { FinanceIconPicker } from "@/components/FinanceIconPicker";
import ColorPicker from "@/components/ColorPicker";
import { colorCodes } from "@/helpers";
import Label from "@/components/Label";

export default function CreateCategory() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<Category>({ mode: "onChange" });

  async function handleCreateCategory(data: Category) {
    const nextCategory = {
      ...data,
      userId: user?.uid as string,
    };

    try {
      const newCategoryId = await createCategory(nextCategory);
      console.log("Category created with ID:", newCategoryId);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
    }
  }

  const color = useWatch({
    control,
    name: "color",
  });

  if (!user) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center h-full w-full mt-24">
      <form
        className="flex flex-col justify-center items-center md:w-1/2"
        onSubmit={handleSubmit(handleCreateCategory)}
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
        <div className="relative flex flex-col justify-around items-center mb-4 w-full">
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
              setValue("iconPack", icon.pack);
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
