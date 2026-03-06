"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import Image from "next/image";

import Button from "@/components/Button";
import FormInputField from "@/components/FormInputField";
import { signInWithPassword } from "@/utils/authClient";
import { emailRegex } from "@/helpers";
import logo from "@/public/images/yen-icon.png";
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
  } = useForm<SignupInput>({ mode: "onChange" });

  async function handleLogin(data: SignupInput) {
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
      <div className="flex flex-col h-full w-full justify-center items-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="">
      <form
        className="flex flex-col justify-center h-1/2"
        onSubmit={handleSubmit(handleLogin)}
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
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          Login
        </h1>

        <FormInputField
          type="email"
          placeholder="Email"
          containerClassName="relative flex flex-col justify-around mb-8"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("email", {
            required: "Email is required",
            validate: (email) =>
              emailRegex.test(email) ? true : "Invalid email format",
          })}
          error={errors.email?.message}
        />

        <FormInputField
          type="password"
          placeholder="Password"
          containerClassName="relative flex flex-col justify-around mb-8"
          inputClassName="w-56 sm:w-80 p-2 h-auto"
          registration={register("password", {
            required: "Password is required",
          })}
          error={errors.password?.message}
        />
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
          <Button color="primary" type="submit" text="Log in" />
          <Button
            color="secondary"
            type="button"
            text="Sign up"
            handleChange={(e) => {
              e.preventDefault();
              router.push("/signup");
            }}
          />
        </div>
      </form>
      {/* <button onClick={handleGoogleSignIn}>Sign Up / Login with Google</button> */}
    </div>
  );
}
