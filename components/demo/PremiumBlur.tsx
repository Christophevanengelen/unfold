"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Lock } from "flowbite-react-icons/outline";
import { isIOSBundle } from "@/lib/platform";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

interface PremiumBlurProps {
  children: React.ReactNode;
  /** Context key: "future" | "ai" | undefined → default */
  feature?: string;
  /** Blur amount in px (default 8) */
  blurAmount?: number;
}

export function PremiumBlur({ children, feature, blurAmount = 8 }: PremiumBlurProps) {
  const [locale, setLocaleState] = useState<Locale>("en");
  useEffect(() => {
    setLocaleState(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) setLocaleState(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

  const featureKey = feature === "future" ? "future" : feature === "ai" ? "ai" : "default";
  const text = {
    headline: t(`blur.headline_${featureKey}`, locale),
    sub: t(`blur.sub_${featureKey}`, locale),
  };

  const handleUpgrade = () => {
    // Haptic feedback — medium impact for upgrade CTA
    if (typeof window !== "undefined" && window.Capacitor) {
      import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) => {
        Haptics.impact({ style: ImpactStyle.Medium }).catch(() => {});
      });
    }
    // Dispatch custom event — PremiumTeaser in demo layout listens
    window.dispatchEvent(new CustomEvent("unfold:show-premium"));
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Blurred children */}
      <div
        className="pointer-events-none select-none"
        style={{ filter: `blur(${blurAmount}px)` }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Premium overlay — glass morphism with gradient */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center"
        style={{
          background: "var(--premium-overlay)",
          backdropFilter: "blur(4px)",
        }}
      >
        {/* Lock icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          className="flex items-center justify-center rounded-full"
          style={{
            width: 36,
            height: 36,
            background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          }}
        >
          <Lock size={16} style={{ color: "var(--accent-purple)" }} />
        </motion.div>

        {/* Text */}
        <div>
          <p
            className="font-display text-sm font-semibold"
            style={{ color: "var(--text-heading)", letterSpacing: "-0.01em" }}
          >
            {text.headline}
          </p>
          <p
            className="mt-1 text-[11px] leading-relaxed"
            style={{ color: "var(--text-body-subtle)" }}
          >
            {text.sub}
          </p>
        </div>

        {/* CTA button with glow */}
        <motion.button
          type="button"
          onClick={handleUpgrade}
          whileTap={{ scale: 0.96 }}
          className="mt-1 rounded-full px-5 py-2 text-[11px] font-semibold transition-all duration-200"
          style={{
            background: "var(--accent-purple)",
            color: "#fff",
            boxShadow: "0 0 20px color-mix(in srgb, var(--accent-purple) 40%, transparent), 0 2px 8px rgba(0,0,0,0.3)",
            letterSpacing: "0.01em",
          }}
        >
          {isIOSBundle() ? t("premium.cta_ios", locale) : t("premium.cta_web", locale)}
        </motion.button>
      </motion.div>
    </div>
  );
}
