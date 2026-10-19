"use client";

import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Category, Currency, Transaction, TransactionType } from "@/types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";

const CURRENCIES: { code: Currency; symbol: string }[] = [
  { code: "JPY", symbol: "¥" },
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
];

const ADD_ANOTHER = "add-another";

const labelClassName =
  "mb-[7px] block text-[11px] leading-none font-medium text-[#6B6760]";
const fieldClassName =
  "h-[42px] w-full rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] outline-none placeholder:text-[#A9A49A] focus:border-[1.5px] focus:border-[#17161A] focus:bg-white";
const fieldErrorClassName =
  "border-[1.5px] border-[#B0442A] bg-white focus:border-[#B0442A]";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }
  return (
    <div className="mt-2 flex items-center gap-[7px]" role="alert">
      <span className="h-[5px] w-[5px] flex-none rounded-full bg-[#B0442A]" />
      <span className="text-[11.5px] leading-[1.4] text-[#9E3B21]">
        {message}
      </span>
    </div>
  );
}

function toLocalInputDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function fromLocalInputDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function getDefaultCurrency(accountCurrency?: string): Currency {
  const upper = accountCurrency?.toUpperCase();
  return CURRENCIES.find((c) => c.code === upper)?.code ?? "JPY";
}

export default function CreateTransaction({
  accountId,
  accountName,
  accountCurrency,
  categories,
}: {
  accountId: string;
  accountName?: string;
  accountCurrency?: string;
  categories: Category[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;
  const defaultCurrency = getDefaultCurrency(accountCurrency);
  const detailsHref = `/accounts/${accountId}/details`;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<Transaction>({
    mode: "onChange",
    defaultValues: {
      type: "expense",
      currency: defaultCurrency,
      category_id: categories[0]?.id,
    },
  });

  const selectedCurrency = (watch("currency") as Currency) ?? defaultCurrency;
  const currencySymbol =
    CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol ?? "¥";

  const onSubmit = async (values: Transaction, event?: BaseSyntheticEvent) => {
    const submitter = (event?.nativeEvent as SubmitEvent | undefined)
      ?.submitter;
    const addAnother = submitter?.getAttribute("value") === ADD_ANOTHER;

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
      if (addAnother) {
        reset();
      } else {
        router.push(detailsHref);
      }
      router.refresh();
    });
    showSuccessNotification("Transaction added !");
  };

  return (
    <div className="mx-auto max-w-[640px]">
      <Link
        href={detailsHref}
        className="text-[12px] leading-none font-medium text-[#5C5952] hover:text-[#17161A]"
      >
        ← {accountName ?? "Back to account"}
      </Link>
      <h1 className="mt-2 text-[22px] leading-[1.2] font-semibold tracking-[-0.02em] md:mt-[10px] md:text-[27px]">
        New transaction
      </h1>

      <form
        className="mt-[18px] overflow-hidden rounded-[12px] border border-[#E3DFD7] bg-white"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <fieldset className="grid grid-cols-2 gap-px bg-[#E3DFD7]">
          <legend className="sr-only">Type</legend>
          {(
            [
              {
                id: "expense",
                label: "Expense",
                active: "has-checked:shadow-[inset_0_-2px_0_#E8552F]",
              },
              {
                id: "income",
                label: "Income",
                active: "has-checked:shadow-[inset_0_-2px_0_#0E7C66]",
              },
            ] as const
          ).map((option) => (
            <label
              key={option.id}
              className={clsx(
                "flex h-[46px] cursor-pointer items-center justify-center bg-[#FBFAF7] text-[13px] font-medium text-[#8A857B] has-checked:bg-white has-checked:text-[#17161A] has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-[#17161A]",
                option.active,
              )}
            >
              <input
                type="radio"
                value={option.id}
                className="sr-only"
                {...register("type", { required: "Type is required" })}
              />
              {option.label}
            </label>
          ))}
        </fieldset>

        <div className="px-5 pt-[22px] pb-6">
          <div className="flex items-center gap-[6px] font-mono text-[10px] leading-none font-medium tracking-[0.14em] text-[#5C5952] uppercase">
            <label htmlFor="transaction-amount">Amount</label>
            <span aria-hidden>·</span>
            <select
              aria-label="Currency"
              className="cursor-pointer rounded-[4px] bg-transparent font-mono tracking-[0.14em] text-[#5C5952] uppercase outline-none hover:text-[#17161A] focus-visible:outline-1 focus-visible:outline-[#17161A]"
              {...register("currency", { required: "Currency is required" })}
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.code}
                </option>
              ))}
            </select>
          </div>
          <div
            className={clsx(
              "flex items-baseline gap-2 border-b pt-[10px] pb-[14px]",
              errors.amount ? "border-[#B0442A]" : "border-[#E3DFD7]",
            )}
          >
            <span className="font-mono text-[26px] leading-none font-medium text-[#5C5952]">
              {currencySymbol}
            </span>
            <input
              id="transaction-amount"
              type="number"
              inputMode="decimal"
              step="any"
              min="0"
              placeholder="0"
              aria-invalid={Boolean(errors.amount)}
              className="w-full min-w-0 bg-transparent font-mono text-[34px] leading-none font-semibold tracking-[-0.02em] tabular-nums outline-none [appearance:textfield] placeholder:text-[#C9C3B7] md:text-[40px] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              {...register("amount", {
                required: "Amount is required",
                validate: (value) =>
                  Number(value) > 0 || "An amount above zero is required",
              })}
            />
          </div>
          <FieldError message={errors.amount?.message} />

          <div className="mt-5 grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <div>
              <label htmlFor="transaction-title" className={labelClassName}>
                Title
              </label>
              <input
                id="transaction-title"
                type="text"
                aria-invalid={Boolean(errors.title)}
                className={clsx(
                  fieldClassName,
                  errors.title && fieldErrorClassName,
                )}
                {...register("title", { required: "Title is required" })}
              />
              <FieldError message={errors.title?.message} />
            </div>
            <div>
              <label htmlFor="transaction-date" className={labelClassName}>
                Date
              </label>
              <Controller
                control={control}
                name="date"
                rules={{
                  required: "Date is required",
                  validate: (value) =>
                    !value ||
                    toLocalInputDate(value) <= toLocalInputDate(new Date()) ||
                    "The date can't be in the future",
                }}
                render={({ field }) => (
                  <input
                    id="transaction-date"
                    type="date"
                    aria-invalid={Boolean(errors.date)}
                    className={clsx(
                      fieldClassName,
                      "font-mono",
                      errors.date && fieldErrorClassName,
                    )}
                    value={field.value ? toLocalInputDate(field.value) : ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          ? fromLocalInputDate(e.target.value)
                          : undefined,
                      )
                    }
                    onBlur={field.onBlur}
                  />
                )}
              />
              <FieldError message={errors.date?.message} />
            </div>
          </div>

          <fieldset className="mt-[18px]">
            <legend className="mb-[9px] text-[11px] leading-none font-medium text-[#6B6760]">
              Category
            </legend>
            {categories.length === 0 ? (
              <p className="text-[12px] leading-[1.6] text-[#6B6760]">
                No categories for this account type yet.{" "}
                <Link href="/categories/create">Create one</Link> first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-[7px]">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="group flex h-10 cursor-pointer items-center gap-[7px] rounded-full border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[12px] font-medium text-[#3B3934] has-checked:border-[#17161A] has-checked:bg-[#17161A] has-checked:text-[#F7F5F1] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-[#17161A] sm:h-[34px]"
                  >
                    <input
                      type="radio"
                      value={category.id}
                      className="sr-only"
                      {...register("category_id", {
                        required: "Category is required",
                      })}
                    />
                    <span className="h-[7px] w-[7px] rounded-[2px] bg-[#C9C3B7] group-has-checked:bg-[#E8552F]" />
                    {category.name}
                  </label>
                ))}
              </div>
            )}
            <FieldError message={errors.category_id?.message} />
          </fieldset>

          <div className="mt-[18px]">
            <label htmlFor="transaction-note" className={labelClassName}>
              Note <span className="text-[#A9A49A]">optional</span>
            </label>
            <textarea
              id="transaction-note"
              rows={3}
              className={clsx(
                fieldClassName,
                "h-auto min-h-[66px] py-[11px] leading-[1.5]",
              )}
              {...register("note")}
            />
          </div>

          <div className="mt-[22px] flex flex-col gap-[9px] sm:flex-row">
            <button
              type="submit"
              disabled={isMutating}
              className="h-[46px] flex-1 cursor-pointer rounded-[10px] bg-[#B04124] px-4 text-[14px] font-medium text-white transition-colors hover:bg-[#8A331B] disabled:cursor-progress disabled:opacity-[0.72]"
            >
              {isMutating ? "Saving…" : "Save transaction"}
            </button>
            <button
              type="submit"
              value={ADD_ANOTHER}
              disabled={isMutating}
              className="h-[46px] flex-1 cursor-pointer rounded-[10px] border border-[#E3DFD7] bg-white px-4 text-[14px] font-medium text-[#3B3934] transition-colors hover:bg-[#FBFAF7] disabled:cursor-progress disabled:text-[#5C5952]"
            >
              Save &amp; add another
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
