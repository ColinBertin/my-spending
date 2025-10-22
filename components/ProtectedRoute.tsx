// components/ProtectedRoute.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { auth } from "../app/lib/firebase";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ProtectedRoute({ children, fallback = <p>Loading...</p> }: Props) {
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  if (user === null) return fallback;
  if (!user) {
    window.location.href = "/signup";
    return null;
  }

  return <>{children}</>;
}
