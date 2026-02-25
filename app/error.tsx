"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-6">
      <h2 className="text-6xl">Something went wrong!</h2>
      <button
        className="text-center cursor-pointer bg-orange-dark hover:bg-orange-light text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-40 mb-2 sm:mb-0"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
