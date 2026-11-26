"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { BaseSyntheticEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { Category, Currency, Transaction, TransactionType } from "@/types";
import { CURRENCIES } from "@/app/(routes)/accounts/_components/currency-picker";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageHeader from "@/components/ui/PageHeader";
import Input from "@/components/ui/Input";
import DatePicker from "@/components/ui/DatePicker";
import { toLocalInputDate } from "@/lib/dates";
import FormFooter, { type ActionButton } from "@/components/ui/FormFooter";
import Textarea from "@/components/ui/Textarea";
import AmountField from "../_components/amount-field";
import CategoryChips from "../_components/category-chips";
import TransactionTypeTabs from "../_components/transaction-type-tabs";

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

  const actionButtons: ActionButton[] = [
    {
      text: isMutating ? "Saving…" : "Save transaction",
      type: "submit",
      size: "lg",
      isMutating,
    },
    {
      text: isMutating ? "Saving…" : "Save & add another",
      type: "submit",
      size: "lg",
      variant: "outline",
      isMutating,
      value: "add-another",
    },
    {
      text: "Cancel",
      type: "button",
      size: "lg",
      variant: "outline",
      isMutating,
      handleClick: () => router.back(),
      className: "sm:min-w-40",
    },
  ];
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
    const addAnother = submitter?.getAttribute("value") === "add-another";

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
    <div className="mx-auto max-w-160">
      <PageHeader
        href={detailsHref}
        linkText={accountName ?? "Back to account"}
        title="New transaction"
      />

      <form
        className="mt-4.5 overflow-hidden rounded-card border border-hairline bg-white"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <TransactionTypeTabs register={register} />

        <div className="px-5 pt-5.5 pb-6">
          <AmountField
            register={register}
            currencySymbol={currencySymbol}
            error={errors.amount?.message}
          />

          <div className="mt-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Input
              id="transaction-title"
              title="Title"
              aria-invalid={Boolean(errors.title)}
              {...register("title", {
                required: "Title is required",
                validate: (value) =>
                  value.trim().length > 0 || "Title is required",
              })}
              errorMessage={errors.title?.message}
            />
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
                <DatePicker
                  id="transaction-date"
                  title="Date"
                  aria-invalid={Boolean(errors.date)}
                  errorMessage={errors.date?.message}
                  max={new Date()}
                  {...field}
                />
              )}
            />
          </div>

          <CategoryChips
            register={register}
            categories={categories}
            error={errors.category_id?.message}
            className="mt-4.5"
          />

          <Textarea
            id="transaction-note"
            title="Note"
            optional
            containerClassName="mt-4.5"
            {...register("note")}
          />

          <FormFooter actionButtons={actionButtons} />
        </div>
      </form>
    </div>
  );
}
