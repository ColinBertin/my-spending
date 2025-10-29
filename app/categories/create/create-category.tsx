"use client";

import { auth } from "@/firebaseConfig";
import { useAuthState } from "react-firebase-hooks/auth";
import { Category } from "@/types/firestore";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Loading from "./loading";
import { createCategory } from "@/app/lib/createCategory";

export default function CreateCategory() {
  const router = useRouter();
  const [user] = useAuthState(auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Category>({ mode: "onChange" });

  async function handleCreateCategory(data: Category) {
    const nextCategory = {
      ...data,
      userId: user?.uid as string,
    };

    try {
      const newCategoryId = await createCategory(nextCategory);
      console.log("Category created with ID:", newCategoryId);
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error(err);
    }
  }

  if (!user) return <Loading />;

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <form
        className="flex flex-col justify-center"
        onSubmit={handleSubmit(handleCreateCategory)}
      >
        <h1 className="text-3xl font-semibold text-center text-red mb-10">
          New Category
        </h1>
        <div className="relative flex flex-col justify-around mb-8">
          <input
            type="text"
            placeholder="Name"
            className="border border-gray-500 rounded-xl w-full sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("name", { required: "Name is required" })}
          />
          {errors.name && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.name.message}
            </small>
          )}
        </div>
        <div className="relative flex flex-col justify-around mb-8 w-full">
          <input
            type="text"
            placeholder="Color"
            className="border border-gray-500 rounded-xl w-full sm:w-80 p-2 text-gray-700 font-medium focus:border-purple-300"
            {...register("color", { required: "Color is required" })}
          />
          {errors.color && (
            <small className="absolute top-11 left-2 text-red-300">
              {errors.color.message}
            </small>
          )}
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
