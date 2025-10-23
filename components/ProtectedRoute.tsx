"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "../app/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import Loading from "@/app/loading";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  // React Firebase Hook for auth state
  const [user, userLoading, userError] = useAuthState(auth);

  // Redirect if not logged in (except signup/login routes)
  useEffect(() => {
    if (!user && !userLoading && pathname !== "/signup" && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, userLoading, pathname, router]);

  // Handle loading state
  if (userLoading) return <Loading />;

  // Optional: Handle errors
  if (userError) {
    console.error("Auth error:", userError);
    return <div>Error loading user session.</div>;
  }

  // If no user and not loading, show fallback (e.g., null or redirect page)
  if (!user && !userLoading) {
    return fallback ?? null;
  }

  // If user exists, render protected content
  return <>{children}</>;
}
