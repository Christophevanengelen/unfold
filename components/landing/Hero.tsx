"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AppStoreBadges } from "./AppStoreBadges";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { HeroForm, type HeroFormPayload } from "./HeroForm";
import { LoadingNarrator } from "./LoadingNarrator";
import { HeroSignalCard, type RealSignal } from "./HeroSignalCard";
import { generateSignalFromDate } from "@/lib/signal-generator";
import { buildMockRealSignal } from "@/lib/landing-mock";
import type { TranslationMap } from "@/lib/i18n";

interface HeroProps {
  translations: TranslationMap;
}

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

// Background floating boudins — purely decorative
const BG_BOUDINS = [
  { x: "8%",  y: "15%", w: 12, h: 20, color: "#8B7FC2", opacity: 0.08 },
  { x: "85%", y: "10%", w: 16, h: 28, color: "#6BA89A", opacity: 0.06 },
  { x: "15%", y: "35%", w: 10, h: 14, color: "#C4A86B", opacity: 0.07 },
  { x: "90%", y: "40%", w: 20, h: 36, color: "#9585CC", opacity: 0.08 },
  { x: "5%",  y: "60%", w: 14, h: 24, color: "#D89EA0", opacity: 0.06 },
  { x: "80%", y: "65%", w: 18, h: 32, color: "#B07CC2", opacity: 0.1 },
  { x: "20%", y: "80%", w: 12, h: 18, color: "#50C4D6", opacity: 0.06 },
  { x: "75%", y: "85%", w: 14, h: 22, color: "#6BA89A", opacity: 0.07 },
];

const REAL_SIGNAL_ENABLED = process.env.NEXT_PUBLIC_LANDING_REAL_SIGNAL !== "false";

// Lightweight analytics emitter — DNT-respecting, no PII.
function trackEvent(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (navigator.doNotTrack === "1") return;
  // Future: GA / Plausible. For now, surface in console for verification.
  console.log("[hero-event]", name, props ?? {});
}

// ─── Main Hero ──────────────────────────────────────────────

type Phase = "idle" | "loading" | "revealed";

export function Hero({ translations }: HeroProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [signal, setSignal] = useState<RealSignal | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cardCopy = {
    eyebrow: t(translations, "hero.signal.eyebrow", "Signal actif"),
    activeTitle: t(translations, "hero.signal.activeTitle", "Ton mois actuel"),
    teaserTitle: t(translations, "hero.signal.teaserTitle", "Tes 12 prochains mois"),
    teaserBody: t(
      translations,
      "hero.signal.teaserBody",
      "Débloque la timeline complète, les pics à venir et tes recommandations quotidiennes dans l'app.",
    ),
    appStoreCta: t(translations, "hero.signal.appCta", "Télécharge Unfold pour la suite"),
    nextWindow: t(translations, "hero.signal.nextWindow", "Ta prochaine fenêtre forte"),
    lifetimeLine: t(translations, "hero.signal.lifetimeLine", "Tes moments forts dans le temps"),
  };

  const handleSubmit = useCallback(async (payload: HeroFormPayload) => {
    setErrorMessage(null);
    trackEvent("hero_form_submit", {
      birthMonth: payload.birthDate.slice(0, 7),
      hasTime: Boolean(payload.birthTime),
      country: payload.city.country,
    });

    // Cancel any in-flight request
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    if (!REAL_SIGNAL_ENABLED) {
      setSignal(buildMockRealSignal(payload.birthDate));
      setPhase("revealed");
      trackEvent("hero_signal_revealed", { kind: "mock", reason: "flag-off" });
      return;
    }

    setPhase("loading");

    try {
      const res = await fetch("/api/landing/signal", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          birthDate: payload.birthDate,
          birthTime: payload.birthTime,
          latitude: payload.city.latitude,
          longitude: payload.city.longitude,
          timezone: payload.city.timezone,
        }),
      });

      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.message ?? "Trop de tentatives. Réessaie dans une minute.");
        setPhase("idle");
        trackEvent("hero_signal_failed", { status: 429 });
        return;
      }

      if (!res.ok) {
        // Soft fallback to mock so the visitor still sees something
        const data = await res.json().catch(() => ({}));
        if (data?.fallback === "mock") {
          setSignal(buildMockRealSignal(payload.birthDate));
          setPhase("revealed");
          trackEvent("hero_signal_revealed", { kind: "mock", reason: "fallback" });
          return;
        }
        setErrorMessage("Connexion instable. Réessaie dans un instant.");
        setPhase("idle");
        trackEvent("hero_signal_failed", { status: res.status });
        return;
      }

      const data = (await res.json()) as {
        active: Omit<RealSignal, "futureMonths" | "nextMajor" | "lifetime" | "fromCache">;
        nextMajor: RealSignal["nextMajor"];
        lifetime: RealSignal["lifetime"];
        futureMonths: RealSignal["futureMonths"];
        fromCache: boolean;
      };
      const real: RealSignal = {
        ...data.active,
        nextMajor: data.nextMajor ?? null,
        lifetime: data.lifetime ?? null,
        futureMonths: data.futureMonths ?? [],
        fromCache: data.fromCache,
      };
      setSignal(real);
      setPhase("revealed");
      trackEvent("hero_signal_revealed", {
        kind: "real",
        tier: real.tier,
        cached: real.fromCache,
      });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error("[hero] signal fetch failed", err);
      // Fallback to mock so the page never feels broken
      setSignal(buildMockRealSignal(payload.birthDate));
      setPhase("revealed");
      trackEvent("hero_signal_revealed", { kind: "mock", reason: "exception" });
    }
  }, []);

  return (
    <section className="relative overflow-hidden py-28 md:py-36 lg:py-44">
      {/* Decorative background boudins */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BG_BOUDINS.map((b, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              borderRadius: Math.min(b.w, b.h) / 2,
              background: `linear-gradient(135deg, color-mix(in srgb, ${b.color} 50%, transparent), color-mix(in srgb, ${b.color} 20%, transparent))`,
              border: `1px solid color-mix(in srgb, ${b.color} 20%, transparent)`,
              opacity: b.opacity,
            }}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center" threshold={0.05}>
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "hero.v2.eyebrow", "Personal timing engine")}
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            {t(translations, "hero.v2.title", "Some periods of your life feel more intense.")}
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-brand-10 md:text-xl">
            {t(translations, "hero.v2.subtitle", "There is a reason. Enter your birthday.")}
          </p>
        </ScrollReveal>

        <AnimatePresence mode="wait">
          {phase === "idle" && (
            <div key="form">
              <HeroForm
                onSubmit={handleSubmit}
                ctaLabel={t(translations, "hero.cta", "Voir mon signal")}
                privacyNotice={t(
                  translations,
                  "hero.privacy",
                  "Tes données ne sont jamais conservées sans ton accord. Cache anonyme 7 jours, suppression à la demande.",
                )}
              />
              {errorMessage && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  role="alert"
                  className="mx-auto mt-3 max-w-md text-center text-[12px] text-rose-300"
                >
                  {errorMessage}
                </motion.p>
              )}
            </div>
          )}

          {phase === "loading" && <LoadingNarrator key="loader" />}

          {phase === "revealed" && signal && (
            <HeroSignalCard key="real" signal={signal} copy={cardCopy} />
          )}
        </AnimatePresence>

        {phase === "idle" && (
          <ScrollReveal variant="fadeUp" className="mt-8 text-center" threshold={0.05}>
            <p className="text-sm text-brand-10/40">
              {t(translations, "hero.social", "Trusted by 2,400+ people who value clarity")}
            </p>
          </ScrollReveal>
        )}

        {/* Fallback App Store badges — visible only at idle */}
        {phase === "idle" && (
          <ScrollReveal variant="fadeUp" className="mt-6 flex flex-col items-center gap-4" threshold={0.05}>
            <AppStoreBadges />
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
