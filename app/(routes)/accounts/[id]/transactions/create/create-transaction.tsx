"use client";

import Select from "@/components/Select";
import { Category, Transaction, TransactionType } from "@/types";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import Loading from "./loading";
import Calendar from "@/components/Calendar";
import Button from "@/components/Button";
import FormInputField from "@/components/FormInputField";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import { useState, useTransition } from "react";

export default function CreateTransaction({
  accountId,
  categories,
}: {
  accountId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Transaction>({ mode: "onChange" });

  const onSubmit = async (values: Transaction) => {
    setIsFetching(true);
    const id = values.category_id;
    const category = categories.find((cat) => cat.id === id);

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...values,
        category_name: category?.name || "",
        category_icon: category?.icon || "",
        category_icon_pack: category?.icon_pack || "",
        category_color: category?.color || "",
        type: values.type.toLowerCase() as TransactionType,
        currency: values.currency.toLowerCase(),
        account_id: accountId,
      }),
    });

    const json = await res.json().catch(() => ({}));
    setIsFetching(false);

    if (!res.ok) {
      showErrorNotification("Failed to add transaction");
      console.error(json.error);
      return;
    }

    startTransition(() => {
      reset();
      router.refresh();
    });
    showSuccessNotification("Transaction added !");
  };

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
            New Transaction
          </h1>

          <FormInputField
            type="text"
            placeholder="Title"
            registration={register("title", { required: "Title is required" })}
            error={errors.title?.message}
          />

          <div className="w-full max-w-md flex flex-col gap-4 mb-6">
            <div className="relative">
              {categories && (
                <Select
                  defaultValue={categories[0]?.id || ""}
                  options={categories}
                  {...register("category_id", {
                    required: "Category is required",
                  })}
                />
              )}
            </div>
            <div className="relative">
              <Select
                defaultValue={"expense"}
                options={[
                  { id: "expense", name: "Expense" },
                  { id: "income", name: "Income" },
                ]}
                {...register("type", { required: "Type is required" })}
              />
            </div>
            <div className="relative">
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
          </div>

          <FormInputField
            type="number"
            placeholder="Amount"
            registration={register("amount", {
              required: "Amount is required",
            })}
            error={errors.amount?.message}
          />

          <div className="relative w-full max-w-md mb-6">
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

          <div className="w-full flex justify-center mb-2">
            <Controller
              control={control}
              name="date"
              rules={{ required: "Date is required" }}
              render={({ field }) => (
                <Calendar value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          {errors.date && (
            <small className="text-red-500 text-sm text-center mb-3">
              {errors.date.message}
            </small>
          )}

          <div className="w-full max-w-md flex flex-col sm:flex-row justify-center gap-2 mt-2">
            <Button
              type="button"
              handleChange={() => router.back()}
              text="Cancel"
            />
            <Button type="submit" color="primary" text="Add" />
          </div>
        </form>
      </div>
    </div>
  );
}
