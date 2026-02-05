"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { isMockEnabled, mockAuth } from "@/utils/mockData";
import type { AuthUser } from "@/utils/authTypes";

export function useAuthUser() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isMockEnabled()) {
      setUser(mockAuth.getUser());
      setLoading(false);
      const unsubscribe = mockAuth.subscribe((nextUser) => {
        setUser(nextUser);
      });
      return () => unsubscribe();
    }

    const supabase = createClient();
    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) {
          setError(error.message);
        }
        setUser(
          data.session?.user
            ? {
                id: data.session.user.id,
                email: data.session.user.email ?? null,
                user_metadata: data.session.user
                  .user_metadata as AuthUser["user_metadata"],
                app_metadata: data.session.user
                  .app_metadata as AuthUser["app_metadata"],
              }
            : null,
        );
        setLoading(false);
      })
      .catch((err: Error) => {
        if (!isMounted) return;
        setError(err.message);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? null,
              user_metadata: session.user
                .user_metadata as AuthUser["user_metadata"],
              app_metadata: session.user
                .app_metadata as AuthUser["app_metadata"],
            }
          : null,
      );
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, loading, error };
}
