"use client";

import Select from "@/components/Select";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Loading from "../loading";
import Button from "@/components/Button";
import { Account } from "@/types";
import { useState, useTransition } from "react";

export default function CreateAccount() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const isMutating = isPending || isFetching;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Account>({ mode: "onChange" });

  const onSubmit = async (values: Account) => {
    setIsFetching(true);
    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(json.error ?? "Failed to create account");
    }

    setIsFetching(true);
    startTransition(() => {
      router.push("/dashboard");
    });
  };

  if (isMutating) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          New Account
        </h1>

        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.name.message}
            </small>
          )}
        </div>

        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"single"}
            options={[
              { id: "single", name: "Single" },
              { id: "shared", name: "Shared" },
              { id: "professional", name: "Professional" },
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

        <div className="flex flex-col sm:flex-row justify-between">
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
