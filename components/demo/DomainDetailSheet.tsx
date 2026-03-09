"use client";

import { motion, AnimatePresence } from "motion/react";
import type { DomainDetail } from "@/types/api";
import type { DomainKey } from "@/lib/domain-config";
import { InfoCircle } from "flowbite-react-icons/outline";
import { Lightbulb } from "flowbite-react-icons/outline";
import { ExclamationCircle } from "flowbite-react-icons/outline";
import { ChartLineUp } from "flowbite-react-icons/outline";

interface DomainDetailSheetProps {
  open: boolean;
  onClose: () => void;
  domain: DomainKey;
  detail: DomainDetail;
  score: number;
  trend: "rising" | "stable" | "declining";
  color: string;
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
  trend,
  color,
  onPremiumTap,
}: DomainDetailSheetProps) {
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
            style={{ boxShadow: "0 -4px 24px rgba(0,0,0,0.12)" }}
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
              </span>
            </p>

            {/* Detail rows */}
            <div className="space-y-4">
              {rows.map(({ key, label, Icon }) => (
                <div key={key} className="flex gap-3">
                  <div
                    className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center"
                  >
                    <Icon className="h-6 w-6" style={{ color }} />
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

            {/* Premium teaser link */}
            <button
              type="button"
              className="mt-6 w-full rounded-2xl py-3 text-sm font-medium transition-transform active:scale-[0.98]"
              style={{
                background: `color-mix(in srgb, ${color} 8%, var(--bg-secondary))`,
                color,
              }}
              onClick={onPremiumTap}
            >
              {detail.premiumTeaser}
            </button>

            {/* Dismiss */}
            <button
              type="button"
              className="mt-2 w-full py-2 text-xs font-medium"
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
