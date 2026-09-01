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
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const locale = detectLocale();

  useEffect(() => {
    if (params.get("checkout") === "success") {
      setShowSuccessToast(true);
      // Clean URL without triggering a re-render loop
      router.replace("/app/timeline", { scroll: false });
      // Auto-hide after 4s
      const timer = setTimeout(() => setShowSuccessToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [params, router]);

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
