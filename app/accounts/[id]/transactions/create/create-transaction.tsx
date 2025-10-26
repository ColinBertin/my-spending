"use client";

import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import Select from "@/components/Select";
import { Transaction, TransactionType } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import Loading from "./loading";
import Calendar from "@/components/Calendar";
import { createTransaction } from "@/app/lib/createTransaction";

export default function CreateTransaction({ id }: { id: string }) {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Transaction>({ mode: "onChange" });

  if (!user) {
    return <Loading />;
  }

  async function handleCreateAccount(data: Transaction) {
    console.log(data);
    const nextTransaction = {
      ...data,
      type: data.type.toLowerCase() as TransactionType,
      currency: data.currency.toLowerCase(),
      userId: user?.uid as string,
      accountId: id,
    };

    console.log("Creating account with data:", nextTransaction);

    try {
      const newAccountId = await createTransaction(nextTransaction);
      console.log("Account created with ID:", newAccountId);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center pt-20 pb-10">
      <h2>{id}</h2>
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(handleCreateAccount)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          Add Transaction
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
          <Select
            defaultValue={"Expense"}
            options={[
              { id: 1, name: "Expense" },
              { id: 2, name: "Income" },
            ]}
            handleChange={(e) => console.log("Selected type:", e.target.value)}
            {...register("type", { required: "Type is required" })}
          />
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"JPY"}
            options={[
              { id: 1, name: "JPY" },
              { id: 2, name: "EUR" },
              { id: 3, name: "USD" },
            ]}
            handleChange={(e) => console.log("Selected type:", e.target.value)}
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
          <button
            className="bg-red-500 hover:bg-red-300 text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36 mb-2 sm:mb-0 cursor-pointer"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36 cursor-pointer"
            type="submit"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
