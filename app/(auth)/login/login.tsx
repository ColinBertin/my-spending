"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";

import { signInWithPassword } from "@/utils/authClient";
import { emailRegex } from "@/helpers";
import logo from "@/public/images/yen-icon.png";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import { useState, useTransition } from "react";
import Spinner from "@/components/Spinner";

type LoginFormValues = {
  email: string;
  password: string;
};

const fieldClassName =
  "h-11 rounded-[9px] border border-[#E3DFD7] bg-[#FBFAF7] px-3 text-[13px] text-[#17161A] placeholder:text-[#8C887F] outline-none transition-colors focus:border-[1.5px] focus:border-[#17161A] focus:bg-white";

export default function Login() {
  const router = useRouter();

  const showErrorNotification = useErrorNotification();
  const showSuccessNotification = useSuccessNotification();

  const [isPending, startTransition] = useTransition();
  const [isFetching, setIsFetching] = useState(false);

  const isMutating = isFetching || isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: "onChange" });

  async function handleLogin(data: LoginFormValues) {
    try {
      setIsFetching(true);
      const { error } = await signInWithPassword(data.email, data.password);
      setIsFetching(false);
      if (error) {
        console.error("Login error:", error);
        showErrorNotification(error as string);
        return;
      }
      startTransition(() => {
        router.push("/");
        showSuccessNotification("Login successful !");
      });
    } catch (err: unknown) {
      setIsFetching(false);
      console.error("Login error:", err);
    }
  }

  if (isMutating) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center text-[#17161A]">
        <Spinner />
      </div>
    );
  }

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
          Log in
        </h1>
        <p className="text-[13px] leading-[1.6] text-[#5C5952]">
          Welcome back — enter your details to continue.
        </p>
      </div>

      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={handleSubmit(handleLogin)}
      >
        <div className="flex flex-col gap-[7px]">
          <label
            htmlFor="email"
            className="text-[11px] font-medium text-[#5C5952]"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className={fieldClassName}
            {...register("email", {
              required: "Email is required",
              validate: (email) =>
                emailRegex.test(email) ? true : "Invalid email format",
            })}
          />
          {errors.email?.message && (
            <span className="text-[12px] text-[#B0442A]">
              {errors.email.message}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-[7px]">
          <label
            htmlFor="password"
            className="text-[11px] font-medium text-[#5C5952]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className={fieldClassName}
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password?.message && (
            <span className="text-[12px] text-[#B0442A]">
              {errors.password.message}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="mt-2 h-[46px] rounded-[9px] bg-[#B04124] text-[13px] font-medium text-white transition-colors hover:bg-[#8A331B]"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-[13px] text-[#5C5952]">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          className="font-medium text-[#B04124] hover:text-[#8A331B]"
          onClick={() => router.push("/signup")}
        >
          Sign up
        </button>
      </p>
    </div>
  );
}
