"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import logo from "@/public/images/yen-icon.png";
import Spinner from "@/components/Spinner";

const fieldClassName =
  "h-11 rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] placeholder:text-[#8C887F] outline-none transition-colors focus:border-[1.5px] focus:border-[#17161A] focus:bg-white";

export const authSubmitButtonClassName =
  "mt-2 h-[46px] rounded-[9px] bg-[#B04124] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B] cursor-pointer";

export function AuthLoading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-[#17161A]">
      <Spinner />
    </div>
  );
}

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="w-full max-w-[400px] rounded-xl border border-[#E3DFD7] bg-white p-6 sm:p-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FCEDE8]">
          <Image
            src={logo}
            alt="My Spending logo"
            className="h-6 w-6"
            priority
          />
        </span>
        <span
          className="text-[10px] font-medium uppercase tracking-[0.16em] text-[#5C5952]"
          style={{ fontFamily: "var(--font-jetbrains-mono)" }}
        >
          My Spending
        </span>
        <h1 className="text-[26px] font-semibold leading-[1.25] tracking-[-0.02em] text-[#17161A] sm:text-[28px]">
          {title}
        </h1>
        <p className="text-[13px] leading-[1.6] text-[#5C5952]">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

type AuthFieldProps = Omit<ComponentProps<"input">, "id" | "className"> & {
  id: string;
  label: string;
  error?: string;
};

export function AuthField({
  id,
  label,
  error,
  type,
  placeholder,
  ...inputProps
}: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const ToggleIcon = isPasswordVisible ? EyeSlashIcon : EyeIcon;

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor={id} className="text-[11px] font-medium text-[#5C5952]">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={isPassword && isPasswordVisible ? "text" : type}
          placeholder={placeholder}
          className={clsx(fieldClassName, "w-full", isPassword && "pr-11")}
          {...inputProps}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            aria-label={isPasswordVisible ? "Hide password" : "Show password"}
            aria-pressed={isPasswordVisible}
            aria-controls={id}
            className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-[9px] text-[#8C887F] transition-colors hover:text-[#17161A] focus-visible:text-[#17161A] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#17161A]"
          >
            <ToggleIcon className="h-[18px] w-[18px]" aria-hidden />
          </button>
        )}
      </div>
      {error && <span className="text-[12px] text-[#B0442A]">{error}</span>}
    </div>
  );
}

type AuthSwitchPromptProps = {
  prompt: string;
  actionLabel: string;
  onAction: () => void;
};

export function AuthSwitchPrompt({
  prompt,
  actionLabel,
  onAction,
}: AuthSwitchPromptProps) {
  return (
    <p className="mt-6 text-center text-[13px] text-[#5C5952]">
      {prompt}{" "}
      <button
        type="button"
        className="font-medium text-[#B04124] hover:text-[#8A331B] cursor-pointer"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </p>
  );
}
