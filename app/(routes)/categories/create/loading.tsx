"use client";

import Spinner from "../../../../components/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center">
      <Spinner />
    </div>
  );
}
