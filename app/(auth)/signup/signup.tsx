"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";
// import { FcGoogle } from "react-icons/fc";

import { emailRegex } from "@/helpers";
import Button from "@/components/Button";
import { isMockEnabled } from "@/utils/mock/env";
import FormInputField from "@/components/FormInputField";
import logo from "@/public/images/yen-icon.png";
import { signUpWithPassword } from "@/utils/authClient";
import {
  useErrorNotification,
  useSuccessNotification,
} from "@/components/ui/NotificationProvider";
import { useState, useTransition } from "react";
import Spinner from "@/components/Spinner";

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

  if (isMockEnabled()) {
    router.push("/");
  }

  if (isMutating) {
    return (
      <div className="flex flex-col h-full w-full justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <form
        className="flex flex-col justify-center h-1/2"
        onSubmit={handleSubmit(handleSignup)}
      >
        <div className="mb-8 flex flex-col items-center gap-3">
          <Image
            src={logo}
            alt="My Spending logo"
            className="h-16 w-16 sm:h-20 sm:w-20"
            priority
          />
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-dark text-center">
            My Spending
          </h1>
        </div>
        <h1 className="text-3xl font-semibold text-center mb-10">Signup</h1>

        <FormInputField
          placeholder="Username"
          containerClassName="relative mb-8"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("username", {
            required: "Username is required",
          })}
          error={errors.username?.message}
        />

        <FormInputField
          type="email"
          placeholder="Email"
          containerClassName="relative mb-8"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("email", {
            required: "Email is required",
            validate: (email) =>
              emailRegex.test(email) || "Invalid email format",
          })}
          error={errors.email?.message}
        />

        <FormInputField
          type="password"
          placeholder="Password"
          containerClassName="relative mb-8"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("password", {
            required: "Password is required",
          })}
          error={errors.password?.message}
        />

        <FormInputField
          type="password"
          placeholder="Confirm Password"
          containerClassName="relative mb-12"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("confirmPassword", {
            validate: (value, formValues) =>
              value === formValues.password || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Button color="primary" type="submit" text="Sign up" />
          <Button
            color="secondary"
            type="button"
            text="Log in"
            handleChange={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
          />
        </div>
      </form>

      {/* <button
        className="py-2 px-4 rounded-3xl mt-4"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle size={40} />
      </button> */}
    </div>
  );
}
