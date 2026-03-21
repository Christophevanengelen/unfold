"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import type { TranslationMap } from "@/lib/i18n";

function t(translations: TranslationMap, key: string, fallback?: string): string {
  return translations[key] ?? fallback ?? key;
}

interface SmartAlertsProps {
  translations: TranslationMap;
}

// ─── Mock notifications ─────────────────────────────────────
const DEMO_NOTIFICATIONS = [
  {
    id: "peak",
    title: "TOCTOCTOC forming",
    body: "An exceptional momentum window opens tomorrow. 3 planets align — your strongest signal this month.",
    time: "8:02 AM",
    accent: "var(--accent-purple)",
    planets: [
      { color: "#5B7FC2" },
      { color: "#E5A940" },
      { color: "#4BBFAF" },
    ],
  },
  {
    id: "compat",
    title: "Compatibility peak detected",
    body: "Your signal syncs 91% with someone today. Shared Jupiter × Venus transit — rare alignment.",
    time: "Yesterday",
    accent: "#D87EA0",
    planets: [
      { color: "#5B7FC2" },
      { color: "#D87EA0" },
    ],
  },
  {
    id: "shift",
    title: "Momentum shift ahead",
    body: "Saturn enters your signal Thursday. Intensity drops to TOC — plan lighter commitments.",
    time: "2 days ago",
    accent: "#C49B50",
    planets: [
      { color: "#C49B50" },
    ],
  },
];

// ─── Decorative phone status bar ─────────────────────────────
function MiniStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
      <span className="text-[10px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
        9:41
      </span>
      <div className="flex gap-1">
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
        <div className="h-[3px] w-[3px] rounded-full" style={{ background: "var(--text-body-subtle)" }} />
      </div>
    </div>
  );
}

// ─── Single notification card ────────────────────────────────
function NotificationCard({
  notification,
  index,
  isActive,
}: {
  notification: (typeof DEMO_NOTIFICATIONS)[number];
  index: number;
  isActive: boolean;
}) {
  return (
    <motion.div
      className="rounded-2xl px-4 py-3"
      style={{
        background: isActive
          ? "color-mix(in srgb, var(--bg-secondary) 90%, transparent)"
          : "color-mix(in srgb, var(--bg-secondary) 60%, transparent)",
        border: isActive
          ? `1px solid color-mix(in srgb, ${notification.accent} 30%, transparent)`
          : "1px solid color-mix(in srgb, var(--border-muted) 50%, transparent)",
        opacity: isActive ? 1 : 0.5,
        transition: "all 0.4s ease",
      }}
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: isActive ? 1 : 0.5, y: 0, scale: 1 }}
      transition={{
        type: "tween",
        duration: 0.5,
        delay: 0.2 + index * 0.12,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* App icon dot */}
          <div
            className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md"
            style={{
              background: `color-mix(in srgb, ${notification.accent} 20%, transparent)`,
            }}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                background: notification.accent,
                boxShadow: `0 0 4px ${notification.accent}`,
              }}
            />
          </div>
          <span
            className="text-[11px] font-semibold"
            style={{ color: "var(--text-heading)" }}
          >
            {notification.title}
          </span>
        </div>
        <span
          className="flex-shrink-0 text-[8px]"
          style={{ color: "var(--text-disabled)" }}
        >
          {notification.time}
        </span>
      </div>

      {/* Body */}
      <p
        className="mt-1.5 text-[9px] leading-relaxed"
        style={{ color: "var(--text-body-subtle)" }}
      >
        {notification.body}
      </p>

      {/* Planet dots */}
      <div className="mt-2 flex gap-0.5">
        {notification.planets.map((p, j) => (
          <div
            key={j}
            className="h-[5px] w-[5px] rounded-full"
            style={{
              background: p.color,
              boxShadow: `0 0 3px ${p.color}`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Main component ──────────────────────────────────────────
export function SmartAlerts({ translations }: SmartAlertsProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Start when scrolled into view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) setStarted(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Auto-cycle through notifications
  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % DEMO_NOTIFICATIONS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [started]);

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* Header */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <p className="mb-4 font-display text-sm font-medium uppercase tracking-widest text-logo-lavender">
            {t(translations, "alerts.eyebrow", "Quiet intelligence")}
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {t(translations, "alerts.title", "It watches. You live.")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {t(
              translations,
              "alerts.subtitle",
              "Unfold doesn\u2019t spam you. It watches your signal quietly \u2014 and calls when something exceptional forms.",
            )}
          </p>
        </ScrollReveal>

        {/* Phone mockup */}
        <ScrollReveal variant="scaleIn" className="mt-16 flex justify-center" threshold={0.1}>
          <div
            ref={sectionRef}
            className="phone-parallax relative overflow-hidden"
            style={{
              width: 320,
              height: 594,
              borderRadius: "2.25rem",
              boxShadow: "0 8px 60px rgba(20, 15, 45, 0.6), 0 2px 20px rgba(20, 15, 45, 0.35)",
              background: "var(--bg-primary)",
            }}
            role="img"
            aria-label="Unfold app showing smart notification cards for momentum peaks and shifts"
          >
            {/* Gradient mesh */}
            <div
              className="pointer-events-none absolute inset-0"
              aria-hidden="true"
              style={{
                background: [
                  "radial-gradient(ellipse 140% 45% at 50% -5%, var(--gradient-top) 0%, transparent 65%)",
                  "radial-gradient(circle 250px at 90% 90%, var(--gradient-right) 0%, transparent 70%)",
                ].join(", "),
              }}
            />

            <div className="relative z-10 flex h-full flex-col">
              <MiniStatusBar />

              {/* Notification header */}
              <div className="px-5 pt-3 pb-2">
                <p
                  className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                  style={{ color: "color-mix(in srgb, var(--accent-purple) 70%, transparent)" }}
                >
                  Alerts
                </p>
              </div>

              {/* Notification cards */}
              <div className="flex flex-1 flex-col gap-2.5 px-4 pb-6">
                <AnimatePresence>
                  {DEMO_NOTIFICATIONS.map((notif, i) => (
                    <NotificationCard
                      key={notif.id}
                      notification={notif}
                      index={i}
                      isActive={i === activeIdx}
                    />
                  ))}
                </AnimatePresence>

                {/* Quiet status message */}
                <motion.div
                  className="mt-auto flex flex-col items-center gap-1.5 pt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{
                      background: "var(--accent-purple)",
                      boxShadow: "0 0 6px var(--accent-purple)",
                    }}
                  />
                  <p
                    className="text-[9px]"
                    style={{ color: "var(--text-body-subtle)", opacity: 0.5 }}
                  >
                    Watching your signal quietly
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Value props below phone */}
        <ScrollReveal variant="fadeUp" delay={0.2} className="mt-12 mx-auto max-w-md text-center">
          <div className="flex items-center justify-center gap-6 text-sm font-medium text-logo-lavender/70">
            <span>{t(translations, "alerts.p1", "Only when it matters")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t(translations, "alerts.p2", "Never noise")}</span>
            <span aria-hidden="true" className="text-brand-10/30">|</span>
            <span>{t(translations, "alerts.p3", "Always on time")}</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
