"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { scaleIn } from "@/lib/animations";
import { CheckCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { saveBirthData, resolveCity, type BirthData } from "@/lib/birth-data";
import type { OnboardingFormData } from "./StepInput";
import type { MomentumPhase } from "@/lib/mock-timeline";
import { planetConfig } from "@/lib/domain-config";

const statusLines = [
  "Reading your planetary signals",
  "Building your momentum timeline",
  "Preparing your first capsule",
];

/**
 * Screen 5 — Preparing Your Signal (Progressive Reveal).
 *
 * After the API returns, instead of a flat "ready" state,
 * we show past phases the user can RECOGNIZE ("ah oui, 2019!").
 * This builds trust and creates the "wow moment".
 *
 * Flow: loading → past reveal → present signal → CTA
 */
export function StepPreparing({ formData }: { formData?: OnboardingFormData }) {
  const router = useRouter();
  const { loadSignals, state, phases, isLive } = useMomentum();
  const [completed, setCompleted] = useState<number[]>([]);
  const [visible, setVisible] = useState<number[]>([0]);
  const [error, setError] = useState<string | null>(null);
  const [revealPhase, setRevealPhase] = useState<"loading" | "past" | "present" | "ready">("loading");
  const allDone = completed.length === statusLines.length;
  const didStart = useRef(false);

  // Get memorable past phases for the reveal
  const pastHighlights = phases
    .filter(p => p.status === "past" && p.intensity >= 70)
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3);

  // Get current phase
  const currentPhase = phases.find(p => p.status === "current");

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    async function run() {
      setVisible([0]);

      const coords = resolveCity(formData?.placeOfBirth || "Brussels");
      const birthData: BirthData = {
        nickname: formData?.nickname || "You",
        birthDate: formData?.dob || "1990-01-15",
        birthTime: formData?.timeOfBirth || "12:00",
        latitude: coords.lat,
        longitude: coords.lng,
        timezone: coords.tz,
        placeOfBirth: formData?.placeOfBirth || "Brussels",
      };

      saveBirthData(birthData);

      try {
        setTimeout(() => {
          setCompleted((c) => [...c, 0]);
          setVisible((v) => [...v, 1]);
        }, 800);

        await loadSignals(birthData);

        setCompleted((c) => [...c, 1]);
        setVisible((v) => [...v, 2]);

        setTimeout(() => {
          setCompleted((c) => [...c, 2]);
          // Start progressive reveal after loading completes
          setTimeout(() => setRevealPhase("past"), 600);
          setTimeout(() => setRevealPhase("present"), 3500);
          setTimeout(() => setRevealPhase("ready"), 5500);
        }, 600);
      } catch {
        setError("Connection issue. Using sample data instead.");
        setCompleted([0, 1, 2]);
        setVisible([0, 1, 2]);
        setTimeout(() => setRevealPhase("past"), 400);
        setTimeout(() => setRevealPhase("present"), 2500);
        setTimeout(() => setRevealPhase("ready"), 4000);
      }
    }

    run();
  }, [formData, loadSignals]);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-5">
      <AnimatePresence mode="wait">
        {/* ── LOADING PHASE ── */}
        {revealPhase === "loading" && (
          <motion.div
            key="loading"
            className="flex flex-col items-center"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ring indicator */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="var(--border-muted)" strokeWidth="3" />
                {!allDone && (
                  <motion.circle
                    cx="44" cy="44" r="38" fill="none"
                    stroke="var(--accent-purple)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="80 159"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "44px 44px" }}
                  />
                )}
                {allDone && (
                  <motion.circle
                    cx="44" cy="44" r="38" fill="none"
                    stroke="var(--success)" strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </svg>
            </motion.div>

            <motion.h1
              className="mb-2 font-display text-xl font-bold"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              Preparing your personal signal
            </motion.h1>

            <motion.p
              className="mb-6 max-w-[240px] text-xs leading-relaxed"
              style={{ color: "var(--accent-purple)", opacity: 0.5 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              We&apos;re reading your planetary signals and building your momentum timeline.
            </motion.p>

            {/* Status lines */}
            <div className="w-full max-w-[240px] space-y-3 text-left">
              <AnimatePresence>
                {statusLines.map((text, i) =>
                  visible.includes(i) && (
                    <motion.div key={i} className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {completed.includes(i) ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                            <CheckCircle className="h-4 w-4" style={{ color: "var(--success)" }} />
                          </motion.div>
                        ) : (
                          <motion.div animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-transparent"
                              style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }} />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-sm"
                        style={{ color: "var(--accent-purple)", opacity: completed.includes(i) ? 0.7 : 0.5 }}>
                        {text}
                      </span>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>

            {error && allDone && (
              <motion.p className="mt-4 max-w-[240px] text-center text-[11px]"
                style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* ── PAST REVEAL — "Reconnais ton passé" ── */}
        {revealPhase === "past" && pastHighlights.length > 0 && (
          <motion.div
            key="past"
            className="flex flex-col items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-purple)", opacity: 0.5 }}
            >
              Do you recognize these?
            </motion.p>

            <motion.h2
              className="font-display text-xl font-bold mb-6"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
            >
              Your strongest past periods
            </motion.h2>

            <div className="w-full max-w-[280px] space-y-3">
              {pastHighlights.map((phase, i) => (
                <PastPhaseCard key={phase.id} phase={phase} delay={i * 0.3} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PRESENT REVEAL — current signal ── */}
        {revealPhase === "present" && (
          <motion.div
            key="present"
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-purple)", opacity: 0.5 }}
            >
              Right now
            </motion.p>

            <motion.h2
              className="font-display text-xl font-bold mb-2"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
            >
              {currentPhase?.title ?? "Your signal is active"}
            </motion.h2>

            {currentPhase && (
              <>
                <motion.p
                  className="mb-4 max-w-[260px] text-sm leading-relaxed"
                  style={{ color: "var(--accent-purple)", opacity: 0.7 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentPhase.description}
                </motion.p>

                {/* Planet pills */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentPhase.planets.map((planet) => {
                    const cfg = planetConfig[planet];
                    return (
                      <span key={planet} className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: `color-mix(in srgb, ${cfg?.color ?? "#9585CC"} 15%, transparent)`,
                          color: cfg?.color ?? "#9585CC",
                        }}>
                        {cfg?.label ?? planet}
                      </span>
                    );
                  })}
                </motion.div>

                {currentPhase.keyInsight && (
                  <motion.p
                    className="max-w-[240px] text-center text-[11px] italic leading-relaxed"
                    style={{ color: "var(--accent-purple)", opacity: 0.6 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    &ldquo;{currentPhase.keyInsight}&rdquo;
                  </motion.p>
                )}
              </>
            )}
          </motion.div>
        )}

        {/* ── READY — CTA ── */}
        {revealPhase === "ready" && (
          <motion.div
            key="ready"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <svg width="64" height="64" viewBox="0 0 88 88">
                <motion.circle
                  cx="44" cy="44" r="38" fill="none"
                  stroke="var(--success)" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.path
                  d="M30 44 L40 54 L58 36"
                  fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            <motion.h1
              className="mt-4 font-display text-2xl font-bold"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Your signal is ready.
            </motion.h1>

            <motion.p
              className="mt-2 max-w-[240px] text-xs leading-relaxed"
              style={{ color: "var(--accent-purple)", opacity: 0.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {isLive
                ? "Built from real planetary data for your exact birth moment."
                : "Explore with sample data. Enter your birth info for a personal reading."}
            </motion.p>

            <motion.div
              className="mt-8 w-full max-w-[240px]"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <button
                type="button"
                onClick={() => router.push("/demo")}
                className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
              >
                See my signal
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Past Phase Card (for "Reconnais ton passé") ─────────

function PastPhaseCard({ phase, delay }: { phase: MomentumPhase; delay: number }) {
  const year = new Date(phase.startDate + "T00:00:00").getFullYear();

  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "var(--bg-secondary)" }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Year */}
      <span
        className="font-display text-2xl font-bold tabular-nums"
        style={{ color: "var(--accent-purple)", opacity: 0.4 }}
      >
        {year}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-heading truncate">
          {phase.title}
        </p>
        <p className="text-[10px] text-text-body-subtle truncate">
          {phase.subtitle}
        </p>
      </div>

      {/* Intensity indicator */}
      <div className="flex items-center gap-1">
        {phase.planets.slice(0, 3).map((planet) => {
          const cfg = planetConfig[planet];
          return (
            <div
              key={planet}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cfg?.color ?? "#9585CC" }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
