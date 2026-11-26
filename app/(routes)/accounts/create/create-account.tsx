"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { Account } from "@/types";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import PageLayout from "@/components/layout/PageLayout";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import AccountTypePicker from "../_components/account-type-picker";
import CurrencyPicker from "../_components/currency-picker";
import FormFooter, { type ActionButton } from "@/components/ui/FormFooter";

export default function CreateAccount() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const isMutating = isPending || isFetching;

  const actionButtons: ActionButton[] = [
    {
      text: isMutating ? "Creating…" : "Create account",
      type: "submit",
      size: "lg",
      isMutating,
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
      router.push(`/accounts/${json.id}/details`);
    });
    showSuccessNotification("New Account created !");
  };

  return (
    <PageLayout>
      <>
        <PageHeader
          href="/accounts"
          linkText="Accounts"
          title="New account"
          subTitle="The type decides what the account can do later — professional accounts
          are the only ones that export a 元帳."
        />
        <form
          className="mt-4.5 rounded-card border border-hairline bg-white px-5 pt-5.5 pb-6"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Input
            id="account-name"
            title="Name"
            aria-invalid={Boolean(errors.name)}
            {...register("name", {
              required: "Name is required",
              validate: (value) =>
                value.trim().length > 0 || "Name is required",
            })}
            errorMessage={errors.name?.message}
          />

          <AccountTypePicker
            register={register}
            error={errors.type?.message}
            className="mt-8"
          />

          <CurrencyPicker
            register={register}
            error={errors.currency?.message}
            className="mt-8"
          />

          <FormFooter actionButtons={actionButtons} />
        </form>
      </>
    </PageLayout>
  );
}
