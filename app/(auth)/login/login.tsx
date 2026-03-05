"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import Button from "@/components/Button";
import { signInWithPassword } from "@/utils/authClient";
import { emailRegex } from "@/helpers";
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
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          Login
        </h1>

        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="email"
            placeholder="Email"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700 font-medium"
            {...register("email", {
              required: "Email is required",
              validate: (email) =>
                emailRegex.test(email) ? true : "Invalid email format",
            })}
          />
          {errors.email && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.email.message}
            </small>
          )}
        </div>

        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="password"
            placeholder="Password"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700"
            {...register("password", { required: "Password is required" })}
          />
          {errors.password && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.password.message}
            </small>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
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
