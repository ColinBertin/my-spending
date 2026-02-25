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
    <div className="w-full px-4 sm:px-6 pt-24 pb-12">
      <div className="mx-auto w-full max-w-5xl flex justify-center">
        <form
          className="w-full max-w-2xl rounded-2xl border border-blue-dark/20 bg-white p-5 sm:p-6 shadow-sm flex flex-col items-center"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h1 className="text-3xl font-semibold text-center text-red mb-8">
            New Account
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

          <div className="w-full max-w-md flex flex-col gap-4 mb-6">
            <div className="relative">
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

          <div className="w-full max-w-md flex flex-col sm:flex-row justify-center gap-2">
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
