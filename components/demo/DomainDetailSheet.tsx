"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCallback, useRef } from "react";
import type { DomainDetail } from "@/types/api";
import type { DomainKey } from "@/lib/domain-config";
import { InfoCircle } from "flowbite-react-icons/outline";
import { Lightbulb } from "flowbite-react-icons/outline";
import { ExclamationCircle } from "flowbite-react-icons/outline";
import { ChartLineUp } from "flowbite-react-icons/outline";
import { formatDelta, getDeltaColor } from "@/lib/animations";

interface DomainDetailSheetProps {
  open: boolean;
  onClose: () => void;
  domain: DomainKey;
  detail: DomainDetail;
  score: number;
  delta: number;
  trend: "rising" | "stable" | "declining";
  color: string;
  caution?: string;
  onPremiumTap: () => void;
}

const rows = [
  { key: "whatItMeans" as const, label: "What it means", Icon: InfoCircle },
  { key: "bestUse" as const, label: "Best use", Icon: Lightbulb },
  { key: "watchOut" as const, label: "Watch out", Icon: ExclamationCircle },
  { key: "whenItGetsBetter" as const, label: "When it gets better", Icon: ChartLineUp },
];

/**
 * Bottom-sheet detail report — opens on satellite score tap.
 * Same pattern as PremiumTeaser: backdrop + spring sheet.
 */
export function DomainDetailSheet({
  open,
  onClose,
  domain,
  detail,
  score,
  delta,
  trend,
  color,
  caution,
  onPremiumTap,
}: DomainDetailSheetProps) {
  /** Swipe down to dismiss — detect quick downward swipe via touch events */
  const touchStart = useRef<{ y: number; t: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { y: e.touches[0].clientY, t: Date.now() };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.t;
      touchStart.current = null;
      // Close on downward swipe: >60px distance OR fast flick (>40px in <300ms)
      if (dy > 60 || (dy > 40 && dt < 300)) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — fixed covers entire mobile frame (contained by translateZ(0) on frame) */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet — extends below to cover BottomNav area */}
          <motion.div
            className="absolute inset-x-0 z-50 rounded-t-3xl bg-bg-primary px-6 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ bottom: -56, paddingBottom: 24, boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
          >
            {/* Handle */}
            <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-brand-5" />

            {/* Score title */}
            <p
              className="mb-4 font-display text-base font-semibold"
              style={{ color, letterSpacing: -0.3 }}
            >
              {detail.scoreTitle}{" "}
              <span style={{ color: "var(--text-body-subtle)", fontWeight: 400 }}>
                &middot; {score}
              </span>{" "}
              <span className={`text-sm font-semibold ${getDeltaColor(delta)}`}>
                {formatDelta(delta)}
              </span>
            </p>

            {/* Detail rows */}
            <div className="space-y-4">
              {rows.map(({ key, label, Icon }) => (
                <div key={key} className="flex gap-2.5">
                  <div
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center"
                  >
                    <Icon className="h-5 w-5" style={{ color, strokeWidth: 1.5 }} />
                  </div>
                  <div>
                    <p
                      className="font-medium uppercase"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        color,
                      }}
                    >
                      {label}
                    </p>
                    <p
                      className="mt-0.5 text-sm leading-snug"
                      style={{ color: "var(--text-body)" }}
                    >
                      {detail[key]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Caution quote */}
            {caution && (
              <p
                className="mt-5 text-center text-sm italic leading-snug"
                style={{ color: "var(--text-body-subtle)", opacity: 0.7 }}
              >
                &ldquo;{caution}&rdquo;
              </p>
            )}

            {/* Premium teaser link */}
            <button
              type="button"
              className="mt-6 w-full rounded-2xl py-3 text-sm font-medium transition-transform active:scale-[0.98]"
              style={{
                background: `color-mix(in srgb, var(--accent-purple) 12%, var(--bg-secondary))`,
                color: "var(--accent-purple)",
              }}
              onClick={onPremiumTap}
            >
              {detail.premiumTeaser}
            </button>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
