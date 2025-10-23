"use client";

import { signOut } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "../loading";

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const router = useRouter();

  console.log("Authenticated user:", user);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (!user) return <Loading />;

  return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Welcome, {user.email}</h2>
        <button
          className="bg-gray-700 hover:bg-gray-500 text-white text-center font-semibold py-2 px-4 rounded-3xl self-center w-56 sm:w-36"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
  );
}
