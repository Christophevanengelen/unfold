"use client";

import { useEffect, useState } from "react";
import { BottomSheet } from "./primitives/BottomSheet";
import { signInWithMagicLink } from "@/lib/supabase-auth";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setLocaleState(detectLocale());
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setPhase("loading");

    try {
      await signInWithMagicLink(email.trim());
      setPhase("sent");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("auth.error_generic", locale);
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
              {t("auth.sent_title", locale)}
            </h3>
            <p className="mb-6 text-[13px] font-medium" style={{ color: "var(--text-heading)" }}>
              {email}
            </p>
            <p className="text-[12px]" style={{ color: "var(--text-body-subtle)" }}>
              {t("auth.sent_sub", locale)}
            </p>
            <button
              onClick={handleClose}
              className="mt-8 text-[12px] underline"
              style={{ color: "var(--text-body-subtle)" }}
            >
              {t("common.close", locale)}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 text-center">
              <p className="text-[13px] font-semibold" style={{ color: "var(--text-heading)" }}>
                {t("auth.title", locale)}
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-body-subtle)" }}>
                {t("auth.sub", locale)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
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
                  placeholder={t("auth.email_placeholder", locale)}
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
                {phase === "loading" ? "..." : t("auth.send_link", locale)}
              </button>
            </form>
          </>
        )}
      </div>
    </BottomSheet>
  );
}
