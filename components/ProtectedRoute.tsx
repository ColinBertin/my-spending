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

  const [user, userLoading, userError] = useAuthState(auth);

  useEffect(() => {
    if (!user && !userLoading && pathname !== "/signup" && pathname !== "/login") {
      router.push("/login");
    }
  }, [user, userLoading, pathname, router]);

  if (userLoading) return <Loading />;

  if (userError) {
    console.error("Auth error:", userError);
    return <div>Error loading user session.</div>;
  }

  if (!user && !userLoading) {
    return fallback ?? null;
  }

  return <>{children}</>;
}
