"use client";

import Select from "@/components/Select";
import { Category, Transaction, TransactionType } from "@/types";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import Loading from "./loading";
import Calendar from "@/components/Calendar";
import Button from "@/components/Button";
import { useAuthUser } from "@/utils/useAuthUser";

export default function CreateTransaction({
  accountId,
  categories,
}: {
  accountId: string;
  categories: Category[];
}) {
  const router = useRouter();
  const { user } = useAuthUser();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Transaction>({ mode: "onChange" });

  // async function handleCreateAccount(data: Transaction) {
  //   const id = data.categoryId;
  //   const category = categories.find((cat) => cat.id === id);

  //   const nextTransaction = {
  //     ...data,
  //     categoryName: category?.name || "",
  //     categoryIcon: category?.icon || "",
  //     categoryIconPack: category?.icon_pack || "",
  //     categoryColor: category?.color || "",
  //     type: data.type.toLowerCase() as TransactionType,
  //     currency: data.currency.toLowerCase(),
  //     userId: user?.id as string,
  //     accountId,
  //   };

  //   try {
  //     const newTransaction = await createTransaction(nextTransaction);
  //     console.log("Transaction created with ID:", newTransaction);
  //     router.push(`/accounts/${accountId}/details`);
  //   } catch (err: unknown) {
  //     console.error(err);
  //   }
  // }

  const onSubmit = async (values: Transaction) => {
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

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to create account");
    }

    router.push("/dashboard");
  };

  // useEffect(() => {
  //   if (typeof window === "undefined") return;
  //   getCategories().then((categories) => {
  //     const formatted = categories.map((category) => ({
  //       id: category.id,
  //       name: category.name,
  //       icon: category.icon || "",
  //       iconPack: category.iconPack || "",
  //       iconColor: category.color,
  //     }));
  //     setCategories(formatted);
  //   });
  // }, []);

  if (!user) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center pt-24 sm:pt-30 pb-20">
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
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
              {...register("category_id", {
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
