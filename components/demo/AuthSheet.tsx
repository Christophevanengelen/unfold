"use client";

import { useState } from "react";
import { BottomSheet } from "./primitives/BottomSheet";
import { signInWithMagicLink } from "@/lib/supabase-auth";

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setPhase("loading");

    try {
      await signInWithMagicLink(email.trim());
      setPhase("sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Une erreur est survenue";
      setError(msg);
      setPhase("idle");
    }
  };

  const handleClose = () => {
    setEmail("");
    setPhase("idle");
    setError(null);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={handleClose} maxHeight="60%">
      <div className="px-6 pb-10 pt-2">
        {phase === "sent" ? (
          <div className="flex flex-col items-center py-6 text-center">
            {/* Checkmark */}
            <div
              className="mb-5 flex h-14 w-14 items-center justify-center rounded-full"
              style={{ background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 className="mb-2 text-[17px] font-semibold" style={{ color: "var(--text-heading)" }}>
              Vérifie ta boîte mail
            </h3>
            <p className="mb-1 text-[13px]" style={{ color: "var(--text-body-subtle)" }}>
              Un lien de connexion a été envoyé à
            </p>
            <p className="mb-6 text-[13px] font-medium" style={{ color: "var(--text-heading)" }}>
              {email}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-body-subtle)" }}>
              Clique sur le lien dans le mail — tu seras connecté automatiquement.
            </p>
            <button
              onClick={handleClose}
              className="mt-8 text-[12px] underline"
              style={{ color: "var(--text-body-subtle)" }}
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-heading)" }}>
                Connexion / Inscription
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-body-subtle)" }}>
                Entre ton email — tu recevras un lien magique.
              </p>
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
                  autoFocus
                  className="w-full rounded-lg border px-3 py-3 text-[14px] outline-none transition-colors focus:ring-2"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                    color: "var(--text-heading)",
                  }}
                  placeholder="ton@email.com"
                />
              </div>

              {error && (
                <p className="text-[12px] font-medium" style={{ color: "#f17e7a" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={phase === "loading" || !email.trim()}
                className="w-full rounded-lg py-3 text-[14px] font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent-purple)", color: "#fff" }}
              >
                {phase === "loading" ? "Envoi..." : "Recevoir le lien magique"}
              </button>
            </form>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
