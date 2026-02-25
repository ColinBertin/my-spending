import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found", // Customize the page title
};

export default function NotFound() {
  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-6">
      <h2 className="text-6xl font-bold">404 - Not Found</h2>
      <p>Could not find requested page</p>
      <Link
        className="text-center cursor-pointer bg-orange-dark hover:bg-orange-light text-white font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-40 mb-2 sm:mb-0"
        href="/"
      >
        Return Home
      </Link>
    </div>
  );
}
