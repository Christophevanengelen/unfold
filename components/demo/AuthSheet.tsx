"use client";

import { useRef, useState } from "react";
import { BottomSheet } from "./primitives/BottomSheet";
import { signInWithMagicLink } from "@/lib/supabase-auth";
import { t } from "@/lib/i18n-demo";
import { useLocale } from "@/lib/use-locale";

interface AuthSheetProps {
  open: boolean;
  onClose: () => void;
}

export function AuthSheet({ open, onClose }: AuthSheetProps) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  // POURQUOI un compteur d envoi : `phase` est pose a « loading » a l entree du
  // geste et n est relache que par la reponse du serveur. Si la personne ferme
  // la feuille entre les deux — c est un aller-retour reseau, elle en a
  // largement le temps — handleClose remet bien l etat a zero, puis la reponse
  // arrive et repose « sent ». AuthSheet ne se demonte PAS a la fermeture (seul
  // le contenu de la feuille se demonte), donc cet etat survit : l ouverture
  // suivante affichait « lien envoye » avec une adresse vide, sans formulaire.
  // Une reponse qui ne correspond plus a l envoi en cours est ignoree.
  const envoiCourant = useRef(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError(null);
    setPhase("loading");
    envoiCourant.current += 1;
    const monEnvoi = envoiCourant.current;

    try {
      await signInWithMagicLink(email.trim());
      if (envoiCourant.current !== monEnvoi) return;
      setPhase("sent");
    } catch (err: unknown) {
      if (envoiCourant.current !== monEnvoi) return;
      const msg = err instanceof Error ? err.message : t("auth.error_generic", locale);
      setError(msg);
      setPhase("idle");
    }
  };

  const handleClose = () => {
    // Invalide l envoi en cours : sa reponse ne doit plus rien reposer.
    envoiCourant.current += 1;
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
                    // Le jeton s appelle --card-bg, pas --bg-card. La faute de
                    // frappe ne casse rien bruyamment : un var() inconnu et sans
                    // repli rend la propriete invalide, donc la carte n avait
                    // AUCUN fond, dans les deux themes, en silence.
                    // Christophe, 01/09 : « un bon design minimaliste gere bien
                    // les couleurs des bg et des fonds de cellules ». Celle-ci
                    // n en avait pas.
                    // EXCEPTION ASSUMEE : champ de saisie vide, le contour
                    // reste. Il dit ou taper — c est de la fonction, pas du
                    // decor. Voir la regle du 01/09/2026.
                    background: "var(--card-bg)",
                    borderColor: "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                    color: "var(--text-heading)",
                  }}
                  placeholder={t("auth.email_placeholder", locale)}
                />
              </div>

              {error && (
                <p className="text-[12px] font-medium" style={{ color: "var(--text-erreur)" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={phase === "loading" || !email.trim()}
                className="w-full rounded-lg py-3 text-[14px] font-semibold transition-opacity disabled:opacity-50"
                style={{ background: "var(--accent-purple)", color: "var(--text-on-brand)" }}
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
