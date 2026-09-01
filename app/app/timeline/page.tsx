"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { MomentumTimelineV2 } from "@/components/demo/MomentumTimelineV2";
import { t, detectLocale } from "@/lib/i18n-demo";

/**
 * Timeline page — renders MomentumTimelineV2 and handles post-checkout
 * success toast when redirected from /demo?checkout=success.
 */
export default function TimelinePage() {
  const params = useSearchParams();
  const router = useRouter();
  const locale = detectLocale();

  // Le bandeau est DERIVE de l URL, il n est plus allume par un effet.
  //
  // Il l etait : le premier rendu ne le montrait pas, un effet appelait
  // setShowSuccessToast(true) juste apres, et React 19 signalait la cascade.
  // ?checkout=success est deja la au premier rendu — le layout de /app ne monte
  // ses enfants qu apres l hydratation, donc il n y a pas d ecart possible avec
  // le rendu serveur.
  const retourDePaiement = params.get("checkout") === "success";
  const [bandeauEcoule, setBandeauEcoule] = useState(false);
  const showSuccessToast = retourDePaiement && !bandeauEcoule;

  useEffect(() => {
    if (!retourDePaiement) return;
    const minuteur = setTimeout(() => {
      // setState depuis un minuteur, pas depuis le corps de l effet : c est la
      // reponse a un evenement, pas une correction du premier rendu.
      setBandeauEcoule(true);
      // L URL se nettoie EN MEME TEMPS, pas avant. La nettoyer des le montage
      // effacait le fait dont le bandeau depend maintenant.
      router.replace("/app/timeline", { scroll: false });
    }, 4000);
    return () => clearTimeout(minuteur);
  }, [retourDePaiement, router]);

  return (
    <>
      <MomentumTimelineV2 />

      {/* Post-checkout success toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className="absolute left-1/2 top-16 z-[90] -translate-x-1/2"
            style={{ pointerEvents: "none" }}
          >
            <div
              className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold shadow-xl"
              style={{
                // Paire de la regle 2. --accent-purple est une couleur
                // d ACCENT, pas un fond de bouton : sous du blanc elle vaut
                // 4,46 en theme clair. --bg-brand / --text-on-brand est la
                // paire mesuree, et ce bandeau annonce un paiement reussi —
                // le pire moment pour un libelle qu on ne lit pas.
                background: "var(--bg-brand)",
                color: "var(--text-on-brand)",
                // L ombre reste sur l accent : elle est decorative, aucun
                // texte ne se pose dessus.
                boxShadow: "0 4px 24px color-mix(in srgb, var(--accent-purple) 50%, transparent)",
              }}
            >
              <span>✦</span>
              <span>{t("premium.success_toast", locale)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
