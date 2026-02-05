"use client";

import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { emailRegex } from "@/helpers";
import Button from "@/components/Button";
import { signInWithPassword } from "@/utils/authClient";
// import { useState } from "react";
// import Spinner from "@/components/ui/Spinner";

type SignupInput = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function Login() {
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

  async function handleLogin(data: SignupInput) {
    try {
      const { error } = await signInWithPassword(data.email, data.password);
      if (error) {
        console.error("Login error:", error);
        return;
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Login error:", err);
      // setError(err.message);
    }
  }

  // const onSubmit: SubmitHandler<SignupInput> = async (data) => {
  //   setIsFetching(true);
  //   const res = await fetch(`${process.env.NEXT_PUBLIC_ENDPOINT_URL}/signup/`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       username: data.username,
  //       email: data.email,
  //       password: data.password,
  //     }),
  //   });

  //   if (res.ok) {
  //     await signIn("credentials", {
  //       redirect: false,
  //       username: data.username,
  //       password: data.password,
  //     });
  //     startTransition(() => {
  //       setIsFetching(false);
  //       router.push("/");
  //       showSuccessNotification("Signed up successfully.");
  //     });
  //   } else {
  //     const error = await res.json();
  //     startTransition(() => {
  //       setIsFetching(false);
  //       showErrorNotification(error.detail);
  //     });
  //   }
  // };

  // if (isMutating) {
  //   return (
  //     <div className="flex flex-col h-full w-full justify-center items-center">
  //       <Spinner />
  //     </div>
  //   );
  // }

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
