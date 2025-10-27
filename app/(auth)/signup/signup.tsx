"use client";

import { useForm } from "react-hook-form";
import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

import { emailRegex } from "@/helpers";
// import { useState } from "react";
// import Spinner from "@/components/ui/Spinner";

type SignupInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Signup() {
  const router = useRouter();

  // const showErrorNotification = useErrorNotification();
  // const showSuccessNotification = useSuccessNotification();

  // const [isPending, startTransition] = useTransition();
  // const [isFetching, setIsFetching] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  // const isMutating = isFetching || isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({ mode: "onChange" });

  async function handleSignup(data: SignupInput) {
    // if (!auth) return setError("Firebase Auth not initialized yet");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      await updateProfile(userCredential.user, {
        displayName: data.username,
        // photoURL: "https://example.com/jane-q-user/profile.jpg",
      });

      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Signup error:", err);
    }
  }

  // Google sign-in
  async function handleGoogleSignIn() {
    // if (!auth) return setError("Firebase Auth not initialized yet");

    try {
      // const result = await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Google sign-in error:", err);
      // setError(err.message);
    }
  }

  return (
    <div className="">
      <form
        className="flex flex-col justify-center h-1/2"
        onSubmit={handleSubmit(handleSignup)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          Signup
        </h1>
        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="username"
            placeholder="Username"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("username", { required: "Username is required" })}
          />
          {errors.username && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.username.message}
            </small>
          )}
        </div>
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

        <div className="relative flex flex-col justify-around mb-12">
          <input
            type="password"
            placeholder="Confirm Password"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700"
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value, formValues) => {
                const password = formValues.password;
                return value === password || "Passwords do not match";
              },
            })}
          />
          {errors.confirmPassword && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.confirmPassword.message}
            </small>
          )}
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <button
            className="bg-purple-500 hover:bg-purple-300 text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36 mb-2 sm:mb-0"
            type="submit"
          >
            Sign up
          </button>
          <button
            className="bg-gray-700 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36"
            onClick={(e) => {
              e.preventDefault();
              router.push("/login");
            }}
          >
            Log in
          </button>
        </div>
      </form>
      <button
        className="bg-purple-500 hover:bg-purple-300 text-white font-semibold py-2 px-4 rounded-3xl self-center mt-4 mb-2 sm:mb-0"
        onClick={handleGoogleSignIn}
      >
        Sign Up / Login with Google
      </button>
    </div>
  );
}
