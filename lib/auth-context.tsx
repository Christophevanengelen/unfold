"use client";

/**
 * AuthProvider — React context for Supabase Auth state.
 * Wraps the demo layout to provide { user, isAuthenticated } to all components.
 */

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { onAuthStateChange, getUser } from "@/lib/supabase-auth";
import type { User } from "@supabase/supabase-js";
import { apiFetch } from "@/lib/api-client";

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

  const refresh = useCallback(async () => {
    const u = await getUser();
    setUser(u);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // La verification initiale est LANCEE ici, elle ne s applique pas ici.
    //
    // `refresh()` etait appele nu dans le corps de l effet. Il est asynchrone,
    // donc la session n arrivait de toute facon qu au tour suivant — mais ecrit
    // ainsi, React 19 le lit comme un setState synchrone dans un effet et le
    // signale. Le `void (async () => …)()` dit ce qui se passe vraiment : on
    // demarre une lecture d un systeme EXTERNE, et on ecrit l etat quand la
    // reponse arrive. C est exactement le travail d un effet.
    //
    // `annule` evite d ecrire dans un composant demonte entre-temps : au
    // demarrage de l app, le fournisseur peut se remonter avant que Supabase
    // ait repondu.
    let annule = false;
    void (async () => {
      const u = await getUser();
      if (annule) return;
      setUser(u);
      setIsLoading(false);
    })();

    // Listen for auth state changes (sign in, sign out, token refresh)
    const { data } = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);

      // On first sign-in, link the local device profile to this auth account
      if (event === "SIGNED_IN" && session?.access_token) {
        const deviceId =
          typeof window !== "undefined" ? localStorage.getItem("unfold_device_id") : null;
        if (deviceId) {
          apiFetch("/api/profile/link-auth", {
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
      annule = true;
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
