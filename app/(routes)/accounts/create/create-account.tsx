"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Account, Currency } from "@/types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageLayout from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";

const ACCOUNT_TYPES: {
  id: Account["type"];
  name: string;
  description: string;
}[] = [
  {
    id: "single",
    name: "Single",
    description: "Just you. One balance, one owner.",
  },
  {
    id: "shared",
    name: "Shared",
    description: "Two or more people, split entries.",
  },
  {
    id: "professional",
    name: "Professional",
    description: "Unlocks 元帳 export and account titles.",
  },
];

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: "JPY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
];

const groupLabelClassName =
  "mb-3 text-[11px] leading-none font-medium text-[#6B6760]";

export default function CreateAccount() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Account>({
    mode: "onChange",
    defaultValues: { type: "single", currency: "JPY" },
  });

  const onSubmit = async (values: Account) => {
    setIsFetching(true);
    const res = await fetch("/api/accounts", {
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
    showSuccessNotification("New Account created !");
  };

  return (
    <PageLayout>
      <div>
        <Link
          href="/"
          className="text-[12px] leading-none font-medium text-[#5C5952] hover:text-[#17161A] md:hidden"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-0 md:text-[27px]">
          New account
        </h1>
        <p className="mt-[7px] max-w-[52ch] text-[13px] leading-[1.6] text-[#6B6760]">
          The type decides what the account can do later — professional accounts
          are the only ones that export a 元帳.
        </p>

        <form
          className="mt-[18px] rounded-[12px] border border-[#E3DFD7] bg-white px-5 pt-[22px] pb-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <label
            htmlFor="account-name"
            className="mb-3 block text-[11px] leading-none font-medium text-[#6B6760]"
          >
            Account name
          </label>
          <input
            id="account-name"
            type="text"
            aria-invalid={Boolean(errors.name)}
            className={clsx(
              "h-11 w-full rounded-[9px] border bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] outline-none focus:border-[1.5px] focus:bg-white",
              errors.name
                ? "border-[1.5px] border-[#B0442A] bg-white"
                : "border-[#E3DFD7] focus:border-[#17161A]",
            )}
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length > 0 || "Name is required",
            })}
          />
          {errors.name?.message && (
            <div className="mt-2 flex items-center gap-[7px]" role="alert">
              <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#B0442A]" />
              <span className="text-[11.5px] leading-[1.4] text-[#9E3B21]">
                {errors.name.message}
              </span>
            </div>
          )}

          <fieldset className="mt-8">
            <legend className={groupLabelClassName}>Type</legend>
            <div className="grid grid-cols-1 gap-[9px] sm:grid-cols-3">
              {ACCOUNT_TYPES.map((accountType) => (
                <label
                  key={accountType.id}
                  className="group cursor-pointer rounded-[10px] border border-[#E3DFD7] bg-[#FBFAF7] px-[15px] py-[14px] text-left has-checked:border-[1.5px] has-checked:border-[#17161A] has-checked:bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#17161A]"
                >
                  <input
                    type="radio"
                    value={accountType.id}
                    className="sr-only"
                    {...register("type", { required: "Type is required" })}
                  />
                  <span className="flex items-center gap-[10px]">
                    <span className="h-[15px] w-[15px] flex-none rounded-full border-[1.5px] border-[#C9C3B7] bg-white group-has-checked:border-[4.5px] group-has-checked:border-[#B04124]" />
                    <span className="text-[13px] leading-none font-semibold">
                      {accountType.name}
                    </span>
                  </span>
                  <span className="mt-[9px] block text-[11.5px] leading-[1.5] text-[#6B6760]">
                    {accountType.description}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-8">
            <legend className={groupLabelClassName}>Currency</legend>
            <div className="flex flex-wrap gap-2">
              {CURRENCIES.map((currency) => (
                <label
                  key={currency.code}
                  className="flex h-[46px] cursor-pointer items-center rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-[15px] font-mono text-[13px] font-medium text-[#17161A] has-checked:border-[1.5px] has-checked:border-[#17161A] has-checked:bg-white has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#17161A] sm:h-[42px]"
                >
                  <input
                    type="radio"
                    value={currency.code}
                    className="sr-only"
                    {...register("currency", {
                      required: "Currency is required",
                    })}
                  />
                  {currency.symbol} {currency.code}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row-reverse sm:justify-start">
            <Button
              type="submit"
              size="lg"
              disabled={isMutating}
              className="sm:min-w-[200px]"
            >
              {isMutating ? "Creating…" : "Create account"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              disabled={isMutating}
              className="sm:min-w-[160px]"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
}
