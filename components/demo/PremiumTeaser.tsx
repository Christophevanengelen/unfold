"use client";

import { motion, AnimatePresence } from "motion/react";
import { CalendarDays, Zap, LayoutGrid } from "lucide-react";

interface PremiumTeaserProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: CalendarDays,
    text: "7-day forecast with peak markers",
  },
  {
    icon: Zap,
    text: "Real-time peak alerts",
  },
  {
    icon: LayoutGrid,
    text: "Monthly momentum map",
  },
];

export function PremiumTeaser({ open, onClose }: PremiumTeaserProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-bg-primary px-6 pb-8 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Handle */}
            <div className="mx-auto mb-6 h-1 w-8 rounded-full bg-brand-5" />

            {/* Blurred preview area */}
            <div
              className="mb-6 rounded-2xl"
              style={{
                height: 60,
                background:
                  "linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) 12%, var(--bg-secondary)), var(--bg-secondary))",
                backdropFilter: "blur(8px)",
              }}
            />

            {/* Headline */}
            <h2
              className="mb-2 font-display font-bold"
              style={{
                fontSize: 20,
                color: "var(--text-heading)",
                letterSpacing: -0.5,
              }}
            >
              Unlock your timing advantage
            </h2>
            <p
              className="mb-6 text-[13px]"
              style={{ color: "var(--text-body-subtle)" }}
            >
              See what&apos;s coming before it arrives
            </p>

            {/* Feature bullets */}
            <div className="mb-8 space-y-4">
              {features.map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{
                      background:
                        "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                    }}
                  >
                    <f.icon
                      size={16}
                      strokeWidth={1.5}
                      style={{ color: "var(--accent-purple)" }}
                    />
                  </div>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--text-heading)" }}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              type="button"
              className="mb-3 w-full rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
              style={{
                background: "var(--bg-brand)",
                color: "var(--text-on-brand)",
              }}
              onClick={onClose}
            >
              Upgrade to Premium
            </button>

            {/* Dismiss */}
            <button
              type="button"
              className="w-full py-2 text-xs font-medium"
              style={{ color: "var(--text-body-subtle)" }}
              onClick={onClose}
            >
              Not now
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
