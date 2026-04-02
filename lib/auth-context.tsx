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
    const { data } = onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
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
