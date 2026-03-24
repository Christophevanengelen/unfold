"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { scaleIn } from "@/lib/animations";
import { CheckCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { saveBirthData, resolveCity, type BirthData } from "@/lib/birth-data";
import type { OnboardingFormData } from "./StepInput";
import type { MomentumPhase } from "@/types/momentum";
import { planetConfig } from "@/lib/domain-config";

const statusLines = [
  "Reading your planetary signals",
  "Building your momentum timeline",
  "Preparing your first capsule",
];

// ─── Scan Feed — reveals what the engine is analyzing ────

const SCAN_STEPS = [
  { label: "Pluto deep cycles",       detail: "transformation periods",  delay: 0.5 },
  { label: "Neptune dissolve phases",  detail: "intuition windows",      delay: 2.5 },
  { label: "Uranus breakthrough",      detail: "liberation moments",     delay: 4.5 },
  { label: "Saturn structure tests",   detail: "maturity checkpoints",   delay: 6.5 },
  { label: "Jupiter expansion gates",  detail: "growth opportunities",   delay: 8.5 },
  { label: "Eclipse axis series",      detail: "turning points",         delay: 10.5 },
  { label: "Zodiacal releasing peaks", detail: "life chapter markers",   delay: 13.0 },
  { label: "Station retrogrades",      detail: "revision periods",       delay: 15.5 },
  { label: "Cycle convergences",       detail: "peak intensity windows", delay: 18.0 },
];

function ScanFeed({ isLoading, phaseCount }: { isLoading: boolean; phaseCount: number }) {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isLoading && phaseCount > 100) {
      // Data arrived — show all remaining instantly
      setVisibleCount(SCAN_STEPS.length);
      return;
    }

    const timers = SCAN_STEPS.map((step, i) =>
      setTimeout(() => setVisibleCount(c => Math.max(c, i + 1)), step.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading, phaseCount]);

  const isDone = !isLoading && phaseCount > 100;

  return (
    <motion.div
      className="mt-8 w-full max-w-[240px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-medium uppercase tracking-widest"
          style={{ color: "var(--accent-purple)", opacity: 0.4 }}>
          Scanning your birth chart
        </span>
      </div>

      <div className="space-y-[6px]">
        {SCAN_STEPS.slice(0, visibleCount).map((step, i) => {
          const isLatest = i === visibleCount - 1 && !isDone;
          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Status dot */}
              <div className="flex-shrink-0">
                {isLatest ? (
                  <motion.div
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ background: "var(--accent-purple)" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <div className="h-[5px] w-[5px] rounded-full"
                    style={{ background: isDone ? "var(--success)" : "var(--accent-purple)", opacity: isDone ? 0.8 : 0.3 }}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] font-medium"
                style={{
                  color: "var(--accent-purple)",
                  opacity: isLatest ? 0.8 : 0.35,
                }}>
                {step.label}
              </span>

              {/* Detail — only on latest */}
              {isLatest && (
                <motion.span
                  className="text-[9px] ml-auto"
                  style={{ color: "var(--accent-purple)", opacity: 0.25 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {step.detail}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Final count when done */}
      {isDone && (
        <motion.div
          className="mt-3 flex items-center gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <CheckCircle size={12} style={{ color: "var(--success)" }} />
          <span className="text-[10px] font-medium"
            style={{ color: "var(--success)", opacity: 0.8 }}>
            {phaseCount} signals mapped across your lifetime
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

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
  const { loadSignals, state, phases, isLive, isLoadingLifetime, timelinePhases } = useMomentum();

  // Prefetch timeline chunk + route while user watches the reveal
  useEffect(() => {
    import("@/components/demo/MomentumTimelineV2").catch(() => {});
    router.prefetch("/demo/timeline");
  }, [router]);
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
          // Progressive reveal — respect reading time
          // "ready" is set by the useEffect below when lifetime data arrives
          setTimeout(() => setRevealPhase("past"), 800);       // pause before past reveal
          setTimeout(() => setRevealPhase("present"), 8800);   // 8s to read past highlights
        }, 600);
      } catch {
        setError("Connection issue. Using sample data instead.");
        setCompleted([0, 1, 2]);
        setVisible([0, 1, 2]);
        setTimeout(() => setRevealPhase("past"), 600);
        setTimeout(() => setRevealPhase("present"), 8600);
      }
    }

    run();
  }, [formData, loadSignals]);

  // Wait for lifetime data to be ready, then show "ready" CTA
  // Minimum 4s on "present" phase so user can read, then wait for data
  const presentShownAt = useRef<number>(0);
  useEffect(() => {
    if (revealPhase === "present") {
      presentShownAt.current = Date.now();
    }
  }, [revealPhase]);

  useEffect(() => {
    if (revealPhase !== "present") return;
    if (isLoadingLifetime) return; // still loading — wait

    // Data is ready. Ensure minimum 4s reading time on "present"
    const elapsed = Date.now() - presentShownAt.current;
    const remaining = Math.max(0, 7000 - elapsed);
    const timer = setTimeout(() => setRevealPhase("ready"), remaining);
    return () => clearTimeout(timer);
  }, [revealPhase, isLoadingLifetime]);

  // Safety timeout — don't block forever if lifetime takes too long (45s max)
  useEffect(() => {
    if (revealPhase !== "present") return;
    const timer = setTimeout(() => setRevealPhase("ready"), 45000);
    return () => clearTimeout(timer);
  }, [revealPhase]);

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

            {/* Live scan feed — show the science behind the signal */}
            <ScanFeed isLoading={isLoadingLifetime} phaseCount={timelinePhases.length} />
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
                onClick={() => {
                  // Check for pending invite (from invite link → onboarding → connected)
                  const pending = typeof window !== "undefined" ? sessionStorage.getItem("unfold_pending_invite") : null;
                  if (pending) {
                    try {
                      const invite = JSON.parse(pending);
                      const params = new URLSearchParams({
                        name: invite.name,
                        code: invite.code,
                        bd: invite.birthData.birthDate,
                        bt: invite.birthData.birthTime,
                        lat: String(invite.birthData.latitude),
                        lng: String(invite.birthData.longitude),
                        tz: invite.birthData.timezone,
                        place: invite.birthData.placeOfBirth || "",
                      });
                      sessionStorage.removeItem("unfold_pending_invite");
                      router.push(`/demo/invite/connected?${params.toString()}`);
                      return;
                    } catch { /* ignore parse errors */ }
                  }
                  router.push("/demo/timeline");
                }}
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
