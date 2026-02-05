"use client";

import Select from "@/components/Select";
import { Transaction, TransactionType } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import Loading from "./loading";
import Calendar from "@/components/Calendar";
import { createTransaction } from "@/app/lib/createTransaction";
import { useEffect, useState } from "react";
import { getCategories } from "@/app/lib/getCategories";
import Button from "@/components/Button";
import { useAuthUser } from "@/utils/useAuthUser";

export default function CreateTransaction({
  accountId,
}: {
  accountId: string;
}) {
  const router = useRouter();
  const { user } = useAuthUser();

  const [categories, setCategories] = useState<
    {
      id: string;
      name: string;
      icon: string;
      iconPack: string;
      iconColor: string;
    }[]
  >([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Transaction>({ mode: "onChange" });

  async function handleCreateAccount(data: Transaction) {
    const id = data.categoryId;
    const category = categories.find((cat) => cat.id === id);

    const nextTransaction = {
      ...data,
      categoryName: category?.name || "",
      categoryIcon: category?.icon || "",
      categoryIconPack: category?.iconPack || "",
      categoryColor: category?.iconColor || "",
      type: data.type.toLowerCase() as TransactionType,
      currency: data.currency.toLowerCase(),
      userId: user?.id as string,
      accountId,
    };

    try {
      const newTransaction = await createTransaction(nextTransaction);
      console.log("Transaction created with ID:", newTransaction);
      router.push(`/accounts/${accountId}/details`);
    } catch (err: unknown) {
      console.error(err);
    }
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    getCategories().then((categories) => {
      const formatted = categories.map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon || "",
        iconPack: category.iconPack || "",
        iconColor: category.color,
      }));
      setCategories(formatted);
    });
  }, []);

  if (!user) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center pt-24 sm:pt-30 pb-20">
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(handleCreateAccount)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          New Transaction
        </h1>
        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Title"
            className="border border-gray-500 rounded-xl p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("title", { required: "Title is required" })}
          />
          {errors.title && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.title.message}
            </small>
          )}
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          {categories && (
            <Select
              defaultValue={categories[0]?.name}
              options={categories}
              {...register("categoryId", {
                required: "Category is required",
              })}
            />
          )}
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"Expense"}
            options={[
              { id: "expense", name: "Expense" },
              { id: "income", name: "Income" },
            ]}
            {...register("type", { required: "Type is required" })}
          />
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"JPY"}
            options={[
              { id: "JPY", name: "JPY" },
              { id: "EUR", name: "EUR" },
              { id: "USD", name: "USD" },
            ]}
            {...register("currency", { required: "Currency is required" })}
          />
        </div>
        <div className="relative flex flex-col justify-around mb-8 w-full">
          <input
            type="number"
            placeholder="Amount"
            className="border border-gray-500 rounded-xl w-full p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("amount", { required: "Amount is required" })}
          />
          {errors.amount && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.amount.message}
            </small>
          )}
        </div>
        <div className="relative flex flex-col justify-around mb-8 w-full">
          <textarea
            placeholder="note"
            className="border border-gray-500 rounded-xl w-full p-2 text-gray-700 font-medium focus:border-purple-300"
            rows={4}
            {...register("note")}
          />
          {errors.note && (
            <small className="absolute top-[100%] left-2 mt-1 text-red-300">
              {errors.note.message}
            </small>
          )}
        </div>
        <Controller
          control={control}
          name="date"
          rules={{ required: "Date is required" }}
          render={({ field }) => (
            <Calendar value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.date && (
          <small className="text-red-500 text-sm">{errors.date.message}</small>
        )}
        <div className="flex flex-col sm:flex-row justify-between mt-4">
          <Button
            type="button"
            handleChange={() => router.back()}
            text="Cancel"
          />
          <Button type="submit" color="primary" text="Add" />
        </div>
      </form>
    </div>
  );
}
