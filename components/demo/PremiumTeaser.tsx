"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarMonth, Fire, Grid, WandMagicSparkles, Sun } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { isIOSBundle } from "@/lib/platform";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { useMemo } from "react";
import { useMomentum } from "@/lib/momentum-store";
import { prochainePeriodeForte } from "@/lib/prevision-semaine";
import { useLocale } from "@/lib/use-locale";

interface PremiumTeaserProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumTeaser({ open, onClose }: PremiumTeaserProps) {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const ios = isIOSBundle();

  const { phases } = useMomentum();

  /**
   * La proposition parle de la personne, pas du produit.
   *
   * On montre la FORME de sa prochaine periode marquante — le domaine, la
   * distance, la duree — et jamais la lecture. L information donnee est vraie
   * et verifiable le jour venu ; ce qu on garde est ce qu on vend vraiment.
   *
   * Sans periode forte a venir, on retombe sur la promesse generique. On ne
   * fabrique pas une echeance pour creer de l urgence : quelqu un s en
   * apercevrait, et une seule fois suffirait a perdre sa confiance.
   */
  const apercu = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return prochainePeriodeForte(phases ?? [], d);
  }, [phases]);

  const nomDomaine = apercu
    ? perso(
        apercu.domaine === "love" ? "priorite.love"
          : apercu.domaine === "health" ? "priorite.health_energy"
          : "priorite.career",
        locale,
      )
    : "";
  const titreSpecifique = apercu
    ? (apercu.dansJours <= 1
        ? perso("vente.demain", locale)
        : perso("vente.titre", locale).replace("{n}", String(apercu.dansJours))
      ).replace("{d}", nomDomaine)
    : "";
  const sousTitreSpecifique = apercu
    ? perso("vente.duree", locale).replace("{n}", String(Math.max(1, Math.round(apercu.dureeJours / 7))))
    : "";

  const features = [
    { icon: CalendarMonth, text: t("premium.feature_forecast", locale) },
    { icon: Fire, text: t("premium.feature_alerts", locale) },
    { icon: Grid, text: t("premium.feature_map", locale) },
    { icon: WandMagicSparkles, text: t("premium.feature_unlimited_ai", locale) },
    { icon: Sun, text: t("premium.feature_brief", locale) },
  ];

  const handleUpgrade = async () => {
    if (ios) {
      // iOS anti-steering: cannot link out to web checkout. Just close.
      // Future Phase 4: present native StoreKit IAP sheet instead.
      onClose();
      return;
    }
    // Web/Android: route to /demo/pricing where the in-app checkout flow lives.
    // /demo/pricing is inside the demo layout (safe areas, theme) and handles
    // all 10 languages via lib/i18n-demo.ts. It will prompt sign-in if needed.
    setLoading(true);
    onClose();
    router.push("/app/pricing");
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="78%">
      <div className="px-6 pb-8 pt-2">
        {/* Hero block — gradient orb suggesting premium energy */}
        <div className="mb-5 flex justify-center">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.05, type: "spring", stiffness: 280 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: "var(--accent-purple)",
              boxShadow:
                "0 0 60px color-mix(in srgb, var(--accent-purple) 50%, transparent), 0 0 24px color-mix(in srgb, var(--accent-purple) 80%, transparent)",
            }}
          >
            <WandMagicSparkles size={28} className="text-white" />
          </motion.div>
        </div>

        {/* Headline */}
        <motion.h2
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center font-display font-bold"
          style={{
            fontSize: 22,
            color: "var(--text-heading)",
            letterSpacing: -0.5,
            lineHeight: 1.2,
          }}
        >
          {apercu ? titreSpecifique : t("premium.headline", locale)}
        </motion.h2>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 mt-1.5 text-center text-[13px]"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {apercu ? sousTitreSpecifique : t("premium.sub", locale)}
        </motion.p>

        {/* Feature bullets */}
        <div className="mb-6 space-y-3">
          {features.map((f, i) => (
            <motion.div
              key={f.text}
              initial={{ x: -12, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--accent-purple) 18%, transparent)",
                }}
              >
                <f.icon size={16} style={{ color: "var(--accent-purple)" }} />
              </div>
              <span
                className="text-[13px] font-medium"
                style={{ color: "var(--text-heading)" }}
              >
                {f.text}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Trial pitch — web only */}
        {!ios && (
          <p
            className="mb-3 text-center text-[12px] font-semibold"
            style={{ color: "var(--accent-purple)" }}
          >
            {t("premium.trial_pitch", locale)}
          </p>
        )}

        {/* CTA — primary action */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="mb-3 w-full rounded-2xl py-3.5 text-[14px] font-semibold transition-opacity disabled:opacity-60"
          style={{
            background: "var(--accent-purple)",
            color: "var(--text-on-brand)",
            boxShadow:
              "0 0 20px color-mix(in srgb, var(--accent-purple) 35%, transparent), 0 4px 12px rgba(0,0,0,0.2)",
            letterSpacing: "0.01em",
          }}
          onClick={handleUpgrade}
        >
          {loading
            ? "..."
            : ios
              ? t("premium.cta_ios", locale)
              : t("premium.cta_web", locale)}
        </motion.button>

        {/* Dismiss */}
        <button
          type="button"
          className="w-full py-2 text-[12px] font-medium"
          style={{ color: "var(--text-body-subtle)" }}
          onClick={onClose}
        >
          {t("premium.dismiss", locale)}
        </button>

        {/* Fine print — web only (EU disclosure) */}
        {!ios && (
          <p
            className="mt-3 text-center text-[10px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)", opacity: 0.7 }}
          >
            {t("premium.fine_print", locale)}
          </p>
        )}
      </div>
    </BottomSheet>
  );
}
