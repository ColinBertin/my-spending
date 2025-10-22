"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/login");
      else setUser(u);
    });
    return unsub;
  }, [router]);

  console.log("Current user:", user);

  async function handleLogout() {
    await signOut(auth);
    router.push("/login");
  }

  if (!user) return <p>Loading...</p>;

  return (
    <ProtectedRoute>
      <h1>Protected Dashboard</h1>
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Welcome, {user.email}</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </ProtectedRoute>
  );
}
