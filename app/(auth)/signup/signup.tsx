"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";

import { emailRegex } from "@/helpers";
import Button from "@/components/Button";
import { signInWithOAuth, signUpWithPassword } from "@/utils/authClient";

type SignupInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ mode: "onChange" });

  async function handleSignup(data: SignupInput) {
    try {
      const { error } = await signUpWithPassword(
        data.email,
        data.password,
        data.username,
      );

      if (error) {
        console.error("Signup error:", error);
        return;
      }

      router.push("/dashboard");
    } catch (err) {
      console.error("Unexpected signup error:", err);
    }
  }

  async function handleGoogleSignIn() {
    const { error } = await signInWithOAuth(
      "google",
      `${location.origin}/auth/callback`,
    );

    if (error) {
      console.error("Google sign-in error:", error);
    }
  }

  return (
    <div>
      <form
        className="flex flex-col justify-center h-1/2"
        onSubmit={handleSubmit(handleSignup)}
      >
        <h1 className="text-3xl font-semibold text-center mb-10">Signup</h1>

        <div className="relative mb-8">
          <input
            placeholder="Username"
            className="border rounded-xl w-56 sm:w-80 p-2"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.username.message}
            </small>
          )}
        </div>

        <div className="relative mb-8">
          <input
            type="email"
            placeholder="Email"
            className="border rounded-xl w-56 sm:w-80 p-2"
            {...register("email", {
              required: "Email is required",
              validate: (email) =>
                emailRegex.test(email) || "Invalid email format",
            })}
          />
          {errors.email && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.email.message}
            </small>
          )}
        </div>

        <div className="relative mb-8">
          <input
            type="password"
            placeholder="Password"
            className="border rounded-xl w-56 sm:w-80 p-2"
            {...register("password", { required: "Password is required" })}
          />
        </div>

        <div className="relative mb-12">
          <input
            type="password"
            placeholder="Confirm Password"
            className="border rounded-xl w-56 sm:w-80 p-2"
            {...register("confirmPassword", {
              validate: (value, formValues) =>
                value === formValues.password || "Passwords do not match",
            })}
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-between">
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

      <button
        className="py-2 px-4 rounded-3xl mt-4"
        onClick={handleGoogleSignIn}
      >
        <FcGoogle size={40} />
      </button>
    </div>
  );
}
