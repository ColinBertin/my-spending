import Link from "next/link";

export default function HomePage() {
  return (
    <div className="h-full flex flex-col justify-center items-center gap-4">
      <h1>My Spending</h1>
      <div className="flex justify-center gap-4">
        <Link
          className="bg-gray-700 hover:bg-gray-500 text-white text-center font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36"
          href="/login"
        >
          Login
        </Link>
        <Link
          className="bg-gray-700 hover:bg-gray-500 text-white text-center font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36"
          href="/signup"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
