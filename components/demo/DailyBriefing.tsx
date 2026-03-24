"use client";

/**
 * DailyBriefing — editorial AI card at top of timeline.
 *
 * Grid: 8px base. All spacing = multiples of 8.
 * Touch: minimum 44px targets (Apple HIG).
 * Rule: internal spacing ≤ external spacing.
 *
 * Architecture (atomic design):
 *   useBriefingData (hook) → fetch + cache
 *   DailyBriefing (organism) → state orchestration
 *   BriefingCard (molecule) → card layout
 *   DomainPill (atom) → single pill
 *   BriefingSkeleton (atom) → loading state
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, CloseCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { storage } from "@/lib/storage";
import type { BirthData } from "@/lib/birth-data";
import { S } from "@/lib/layout-constants";

// ─── Types ───────────────────────────────────────────────

interface BriefingData {
  greeting: string;
  summary: string;
  action: string;
  activeDomains: string[];
}

type LoadState = "idle" | "loading" | "ready" | "error";

// ─── Animation ───────────────────────────────────────────

const EASE = [0.4, 0, 0.2, 1] as const;

// ─── Visual tokens ───────────────────────────────────────

const CARD_BG = "rgba(124, 107, 191, 0.06)";
const CARD_BORDER = "1px solid rgba(124, 107, 191, 0.12)";
const CARD_BLUR = "blur(24px)";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// ─── Domain colors ───────────────────────────────────────

const DOMAIN_COLORS: Record<string, string> = {
  carrière: "#7B8CC4", travail: "#7B8CC4", amour: "#BC7A96",
  relations: "#BC7A96", couple: "#BC7A96", santé: "#7BA88A",
  finances: "#B8A472", argent: "#B8A472", famille: "#C48A6A",
  créativité: "#A07FBD", communication: "#6FA3A0", foyer: "#C4727A",
  spiritualité: "#9B85C4", voyage: "#8B80C9", transformation: "#B07AAF",
  "développement personnel": "#9B85C4", opportunités: "#B8A472",
};

function getDomainColor(domain: string): string {
  const lower = domain.toLowerCase();
  for (const [key, color] of Object.entries(DOMAIN_COLORS)) {
    if (lower.includes(key)) return color;
  }
  return "var(--accent-purple)";
}

function todayKey(): string {
  const d = new Date();
  return `daily_briefing_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Hook: data fetching ─────────────────────────────────

function useBriefingData(birthData: BirthData | null) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    if (!birthData) return;
    let cancelled = false;
    setState("loading");

    async function load() {
      const cacheKey = todayKey();

      try {
        const cached = await storage.get<BriefingData>(cacheKey, CACHE_TTL_MS);
        if (cached && !cancelled) { setData(cached); setState("ready"); return; }
      } catch { /* miss */ }

      try {
        const res = await fetch("/api/openai/daily-briefing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthData }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const result: BriefingData = await res.json();
        if (!cancelled) { setData(result); setState("ready"); await storage.set(cacheKey, result); }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [birthData]);

  return { data, state };
}

// ─── Atom: Domain Pill ───────────────────────────────────

function DomainPill({ domain }: { domain: string }) {
  const color = getDomainColor(domain);
  return (
    <span
      className="inline-flex rounded-full font-medium"
      style={{
        fontSize: 10,
        padding: `${S.xs}px ${S.sm + S.xs}px`, // 4px 12px
        color,
        background: `color-mix(in srgb, ${color} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${color} 18%, transparent)`,
      }}
    >
      {domain}
    </span>
  );
}

// ─── Atom: Skeleton ──────────────────────────────────────

function BriefingSkeleton() {
  return (
    <div style={{ padding: `${S.sm}px ${S.px}px` }}>
      <div
        className="rounded-2xl animate-pulse"
        style={{
          background: CARD_BG,
          border: CARD_BORDER,
          padding: `${S.md}px ${S.px}px`,
          height: 48,
        }}
      />
    </div>
  );
}

// ─── Molecule: Card ──────────────────────────────────────

function BriefingCard({
  briefing,
  onDismiss,
}: {
  briefing: BriefingData;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: S.sm }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: CARD_BG,
        backdropFilter: CARD_BLUR,
        border: CARD_BORDER,
        padding: `${S.md}px ${S.px}px ${S.px}px`, // 16 20 20
      }}
    >
      {/* ── Row 1: Eyebrow + Close (aligned) ── */}
      <div
        className="flex items-center"
        style={{ marginBottom: S.md }} // 16px
      >
        <Star style={{ width: 12, height: 12, color: "var(--accent-purple)", opacity: 0.7 }} />
        <span
          className="font-semibold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--accent-purple)",
            opacity: 0.7,
            lineHeight: 1,
            marginLeft: S.sm, // 8px
            flex: 1,
          }}
        >
          Aujourd&apos;hui
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center justify-center"
          style={{
            width: 44,  // Apple HIG minimum
            height: 44,
            marginTop: -S.sm, // compensate padding
            marginRight: -S.sm,
          }}
          aria-label="Fermer"
        >
          <CloseCircle style={{ width: 18, height: 18, color: "var(--accent-purple)", opacity: 0.35 }} />
        </button>
      </div>

      {/* ── Row 2: Summary ── */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "rgba(255, 255, 255, 0.85)",
          marginBottom: S.md, // 16px
          paddingRight: S.sm, // 8px — avoid close button overlap
        }}
      >
        {briefing.summary}
      </p>

      {/* ── Row 3: Action ── */}
      <p
        className="font-medium"
        style={{
          fontSize: 12,
          lineHeight: 1.5,
          color: "var(--accent-purple)",
          marginBottom: S.md, // 16px
        }}
      >
        {briefing.action}
      </p>

      {/* ── Row 4: Domain pills ── */}
      {briefing.activeDomains.length > 0 && (
        <div
          className="flex flex-wrap items-center"
          style={{ gap: S.sm }} // 8px
        >
          {briefing.activeDomains.slice(0, 3).map((domain) => (
            <DomainPill key={domain} domain={domain} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Organism: Container ─────────────────────────────────

export function DailyBriefing({ onDismiss: onDismissParent }: { onDismiss?: () => void } = {}) {
  const { birthData } = useMomentum();
  const { data, state } = useBriefingData(birthData);
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("unfold_briefing_dismissed");
    if (!stored) return false;
    // Only persist for today — show again tomorrow
    return stored === new Date().toISOString().slice(0, 10);
  });
  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("unfold_briefing_dismissed", new Date().toISOString().slice(0, 10));
    onDismissParent?.();
  }, [onDismissParent]);

  if (!birthData || state === "error" || dismissed) return null;
  if (state === "loading" || state === "idle") return null;
  if (!data) return null;

  return (
    <div style={{ padding: `${S.sm}px ${S.px}px` }}>
      <AnimatePresence>
        {!dismissed && <BriefingCard briefing={data} onDismiss={handleDismiss} />}
      </AnimatePresence>
    </div>
  );
}
