"use client";

import Spinner from "../components/Spinner";

export default function Loading() {
  return (
    <div className={`w-full h-full flex justify-center items-center`}>
      <Spinner />
    </div>
  );
}
