"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { signInWithPassword } from "@/utils/authClient";
import { emailRegex } from "@/helpers";
import { Button } from "@/components/ui/Button";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import { useState, useTransition } from "react";
import {
  AuthCard,
  AuthField,
  AuthLoading,
  AuthSwitchPrompt,
  authSubmitButtonClassName,
} from "../auth-ui";

type LoginFormValues = {
  email: string;
  password: string;
};

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
    return <AuthLoading />;
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Welcome back — enter your details to continue."
    >
      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={handleSubmit(handleLogin)}
      >
        <AuthField
          id="email"
          autoComplete="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register("email", {
            required: "Email is required",
            validate: (email) =>
              emailRegex.test(email) ? true : "Invalid email format",
          })}
        />

        <AuthField
          id="password"
          autoComplete="current-password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <Button type="submit" className={authSubmitButtonClassName}>
          Log in
        </Button>
      </form>

      <AuthSwitchPrompt
        prompt="Don't have an account?"
        actionLabel="Sign up"
        onAction={() => router.push("/signup")}
      />
    </AuthCard>
  );
}
