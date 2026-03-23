"use client";

/**
 * DailyBriefing — premium editorial card shown at top of timeline.
 *
 * Fetches a daily AI-synthesized briefing from /api/openai/daily-briefing.
 * Caches in IndexedDB with 12h TTL. Shows skeleton while loading.
 * Glass morphism card with fade-up entrance animation.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star } from "flowbite-react-icons/outline";
import { useMomentum } from "@/lib/momentum-store";
import { storage } from "@/lib/storage";

// ─── Types ───────────────────────────────────────────────

interface BriefingData {
  greeting: string;
  summary: string;
  action: string;
  activeDomains: string[];
}

// ─── Constants ───────────────────────────────────────────

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

function todayKey(): string {
  const d = new Date();
  return `daily_briefing_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Domain pill colors — subtle, premium ────────────────

const DOMAIN_COLORS: Record<string, string> = {
  carrière: "#7B8CC4",
  travail: "#7B8CC4",
  amour: "#BC7A96",
  relations: "#BC7A96",
  couple: "#BC7A96",
  santé: "#7BA88A",
  finances: "#B8A472",
  argent: "#B8A472",
  famille: "#C48A6A",
  créativité: "#A07FBD",
  communication: "#6FA3A0",
  foyer: "#C4727A",
  spiritualité: "#9B85C4",
  voyage: "#8B80C9",
  transformation: "#B07AAF",
};

function getDomainColor(domain: string): string {
  const lower = domain.toLowerCase();
  for (const [key, color] of Object.entries(DOMAIN_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "var(--accent-purple)";
}

// ─── Skeleton ────────────────────────────────────────────

function BriefingSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {/* Eyebrow */}
      <div className="h-2.5 w-24 rounded-full" style={{ background: "rgba(124, 107, 191, 0.15)" }} />
      {/* Greeting */}
      <div className="h-3 w-40 rounded-full" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
      {/* Summary line 1 */}
      <div className="h-3.5 w-full rounded-full" style={{ background: "rgba(255, 255, 255, 0.08)" }} />
      {/* Summary line 2 */}
      <div className="h-3.5 w-3/4 rounded-full" style={{ background: "rgba(255, 255, 255, 0.06)" }} />
      {/* Action */}
      <div className="h-3 w-52 rounded-full mt-1" style={{ background: "rgba(124, 107, 191, 0.12)" }} />
    </div>
  );
}

// ─── Component ───────────────────────────────────────────

export function DailyBriefing() {
  const { birthData } = useMomentum();
  const [briefing, setBriefing] = useState<BriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!birthData) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const cacheKey = todayKey();

      // Check cache first (12h TTL)
      try {
        const cached = await storage.get<BriefingData>(cacheKey, CACHE_TTL_MS);
        if (cached && !cancelled) {
          setBriefing(cached);
          setLoading(false);
          return;
        }
      } catch {
        // Cache miss — continue to fetch
      }

      // Fetch from API
      try {
        const res = await fetch("/api/openai/daily-briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthData }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);

        const data: BriefingData = await res.json();
        if (!cancelled) {
          setBriefing(data);
          setLoading(false);
          // Cache the result
          await storage.set(cacheKey, data);
        }
      } catch (err) {
        console.error("[DailyBriefing] Fetch error:", err);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [birthData]);

  // No birth data — don't render
  if (!birthData) return null;

  return (
    <div className="px-5 pt-2 pb-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "rgba(124, 107, 191, 0.06)",
          backdropFilter: "blur(24px) saturate(150%)",
          border: "1px solid rgba(124, 107, 191, 0.12)",
          padding: "16px 20px",
        }}
      >
        {/* Subtle glow in top-right corner */}
        <div
          className="pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full"
          aria-hidden="true"
          style={{
            background: "radial-gradient(circle, rgba(124, 107, 191, 0.12) 0%, transparent 70%)",
          }}
        />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BriefingSkeleton />
            </motion.div>
          ) : error || !briefing ? (
            <motion.div
              key="fallback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5">
                <Star style={{ width: 12, height: 12, color: "var(--accent-purple)", opacity: 0.7 }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--accent-purple)", opacity: 0.7 }}
                >
                  Aujourd&apos;hui
                </span>
              </div>
              <p className="text-[15px] leading-snug" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                Tes signaux sont actifs. Ouvre un signal pour en savoir plus.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-1.5"
            >
              {/* Eyebrow */}
              <div className="flex items-center gap-1.5">
                <Star style={{ width: 12, height: 12, color: "var(--accent-purple)", opacity: 0.7 }} />
                <span
                  className="text-[10px] font-semibold uppercase tracking-[0.12em]"
                  style={{ color: "var(--accent-purple)", opacity: 0.7 }}
                >
                  Aujourd&apos;hui
                </span>
              </div>

              {/* Greeting */}
              <p
                className="text-[14px] leading-snug"
                style={{ color: "rgba(255, 255, 255, 0.5)" }}
              >
                {briefing.greeting}
              </p>

              {/* Summary — main content */}
              <p
                className="text-[15px] leading-relaxed"
                style={{ color: "rgba(255, 255, 255, 0.88)" }}
              >
                {briefing.summary}
              </p>

              {/* Action line — accent CTA */}
              <p
                className="text-[13px] font-medium leading-snug mt-0.5"
                style={{ color: "var(--accent-purple)" }}
              >
                {briefing.action}
              </p>

              {/* Active domain pills */}
              {briefing.activeDomains.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  {briefing.activeDomains.slice(0, 3).map((domain) => (
                    <span
                      key={domain}
                      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        color: getDomainColor(domain),
                        background: `color-mix(in srgb, ${getDomainColor(domain)} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${getDomainColor(domain)} 20%, transparent)`,
                      }}
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
