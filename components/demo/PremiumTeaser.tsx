"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { CalendarMonth, Fire, Grid, WandMagicSparkles, Sun } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { isIOSBundle } from "@/lib/platform";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

interface PremiumTeaserProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumTeaser({ open, onClose }: PremiumTeaserProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>("en");
  const [loading, setLoading] = useState(false);
  const ios = isIOSBundle();

  useEffect(() => {
    setLocaleState(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) setLocaleState(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

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
    // Web/Android: route to /pricing where the signed-in checkout flow lives.
    // Pricing page will redirect to magic-link auth if not signed in.
    setLoading(true);
    onClose();
    router.push("/fr/pricing");
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
          {t("premium.headline", locale)}
        </motion.h2>
        <motion.p
          initial={{ y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mb-6 mt-1.5 text-center text-[13px]"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {t("premium.sub", locale)}
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
            color: "#fff",
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
