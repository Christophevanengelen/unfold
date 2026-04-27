"use client";

/**
 * AuthProvider — React context for Supabase Auth state.
 * Wraps the demo layout to provide { user, isAuthenticated } to all components.
 */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChange, getUser } from "@/lib/supabase-auth";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Force re-check auth state */
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    const u = await getUser();
    setUser(u);
    setIsLoading(false);
  };

  useEffect(() => {
    // Initial check
    refresh();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // On first sign-in, link the local device profile to this auth account
      if (event === "SIGNED_IN" && session?.access_token) {
        const deviceId =
          typeof window !== "undefined" ? localStorage.getItem("unfold_device_id") : null;
        if (deviceId) {
          fetch("/api/profile/link-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({ deviceId }),
          }).catch(() => {});
        }
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
