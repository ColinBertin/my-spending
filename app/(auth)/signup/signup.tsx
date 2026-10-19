"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
// import { FcGoogle } from "react-icons/fc";

import { emailRegex } from "@/helpers";
import { Button } from "@/components/ui/button";
import { signUpWithPassword } from "@/utils/authClient";
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

type SignupInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
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
  } = useForm<SignupInput>({ mode: "onChange" });

  async function handleSignup(data: SignupInput) {
    setIsFetching(true);
    try {
      const { error } = await signUpWithPassword(
        data.email,
        data.password,
        data.username,
      );
      setIsFetching(false);

      if (error) {
        console.error("Signup error:", error);
        showErrorNotification(error);
        return;
      }

      startTransition(() => {
        router.push("/");
        showSuccessNotification("Signup successful !");
      });
    } catch (err) {
      setIsFetching(false);
      console.error("Unexpected signup error:", err);
    }
  }

  // async function handleGoogleSignIn() {
  //   const { error } = await signInWithOAuth(
  //     "google",
  //     `${location.origin}/auth/callback`,
  //   );

  //   if (error) {
  //     console.error("Google sign-in error:", error);
  //   }
  // }

  if (isMutating) {
    return <AuthLoading />;
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Enter your details to get started."
    >
      <form
        className="mt-8 flex flex-col gap-5"
        onSubmit={handleSubmit(handleSignup)}
      >
        <AuthField
          id="username"
          autoComplete="username"
          label="Username"
          placeholder="Your name"
          error={errors.username?.message}
          {...register("username", {
            required: "Username is required",
          })}
        />

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
              emailRegex.test(email) || "Invalid email format",
          })}
        />

        <AuthField
          id="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password", {
            required: "Password is required",
          })}
        />

        <AuthField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword", {
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          })}
        />

        <Button type="submit" className={authSubmitButtonClassName}>
          Create account
        </Button>
      </form>

      <AuthSwitchPrompt
        prompt="Already have an account?"
        actionLabel="Log in"
        onAction={() => router.push("/login")}
      />

      {/* <button
        className="py-2 px-4 rounded-3xl mt-4"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle size={40} />
      </button> */}
    </AuthCard>
  );
}
