"use client";

import { auth } from "../../../firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { createAccount } from "@/app/lib/createAccount";
import Select from "@/components/Select";
import { Account, AccountType } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Loading from "../loading";

export default function CreateAccount() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Account>({ mode: "onChange" });

  if(!user) {
    return <Loading />;
  }

  async function handleCreateAccount(data: Account) {
    const newAccount = {
      ...data,
      type: data.type.toLowerCase() as AccountType,
      currency: data.currency.toLowerCase(),
      members: data.members,
      userId: user?.uid as string,
      createdAt: new Date(),
    };

    try {
      const newAccountId = await createAccount(newAccount);
      console.log("Account created with ID:", newAccountId);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(handleCreateAccount)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          Account
        </h1>
        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-500 rounded-xl w-56 sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.name.message}
            </small>
          )}
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"Single"}
            options={[
              { id: "single", name: "Single" },
              { id: "shared", name: "Shared" },
            ]}
            {...register("type", { required: "Type is required" })}
          />
        </div>
        <div className="relative flex flex-col justify-around mb-8">
          <Select
            defaultValue={"JPY"}
            options={[
              { id: "JPY", name: "JPY" },
              { id: "EUR", name: "EUR" },
              { id: "USD", name: "USD" },
            ]}
            {...register("currency", { required: "Currency is required" })}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between">
          <button
            className="bg-red-500 hover:bg-red-300 text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36 mb-2 sm:mb-0 cursor-pointer"
            onClick={() => router.back()}
          >
            Cancel
          </button>
          <button
            className="bg-blue-dark hover:bg-blue-light text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36 cursor-pointer"
            type="submit"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
