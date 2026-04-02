"use client";

import { useState } from "react";
import { BottomSheet } from "./primitives/BottomSheet";
import { signUp, signIn } from "@/lib/supabase-auth";
import { useAuth } from "@/lib/auth-context";
import { getBirthData, saveBirthData, clearBirthData, type BirthData } from "@/lib/birth-data";
import { getProfileByAuthId, linkProfileToAuth } from "@/lib/supabase-store";
import { useMomentum } from "@/lib/momentum-store";

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refresh } = useAuth();
  const { loadSignals } = useMomentum();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === "signup") {
        const { user } = await signUp(email, password);
        if (user) {
          // Link current birth data to this new auth account
          await linkProfileToAuth(user.id);
        }
        await refresh();
        onClose();
      } else {
        const { user } = await signIn(email, password);
        if (user) {
          // Load birth data from remote profile
          const profile = await getProfileByAuthId(user.id);
          if (profile) {
            const bd: BirthData = {
              nickname: profile.nickname || "",
              birthDate: profile.birth_date || "",
              birthTime: profile.birth_time || "",
              latitude: profile.latitude || 0,
              longitude: profile.longitude || 0,
              timezone: profile.timezone || "Europe/Brussels",
              placeOfBirth: profile.place_of_birth || "",
            };
            await saveBirthData(bd);
            await loadSignals(bd);
          }
        }
        await refresh();
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="60%">
      <div className="px-6 pb-8 pt-2">
        {/* Toggle */}
        <div className="mb-6 flex gap-1 rounded-lg p-1" style={{ background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)" }}>
          <button
            className="flex-1 rounded-md py-2 text-[12px] font-semibold transition-all"
            style={{
              background: mode === "signin" ? "var(--accent-purple)" : "transparent",
              color: mode === "signin" ? "#fff" : "var(--text-body-subtle)",
            }}
            onClick={() => { setMode("signin"); setError(null); }}
          >
            Se connecter
          </button>
          <button
            className="flex-1 rounded-md py-2 text-[12px] font-semibold transition-all"
            style={{
              background: mode === "signup" ? "var(--accent-purple)" : "transparent",
              color: mode === "signup" ? "#fff" : "var(--text-body-subtle)",
            }}
            onClick={() => { setMode("signup"); setError(null); }}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none transition-colors focus:ring-2"
              style={{
                background: "var(--bg-card)",
                borderColor: "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                color: "var(--text-heading)",
              }}
              placeholder="ton@email.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border px-3 py-2.5 text-[13px] outline-none transition-colors focus:ring-2"
              style={{
                background: "var(--bg-card)",
                borderColor: "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                color: "var(--text-heading)",
              }}
              placeholder={mode === "signup" ? "6 caractères minimum" : ""}
            />
          </div>

          {error && (
            <p className="text-[12px] font-medium" style={{ color: "#f17e7a" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg py-3 text-[13px] font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--accent-purple)", color: "#fff" }}
          >
            {loading
              ? "..."
              : mode === "signin"
                ? "Se connecter"
                : "Créer mon compte"}
          </button>
        </form>
      </div>
    </BottomSheet>
  );
}
