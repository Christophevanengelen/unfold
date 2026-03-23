"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShareNodes, ClipboardCheck, Close, Link } from "flowbite-react-icons/outline";
import { planetConfig, houseConfig, type PlanetKey, type HouseNumber } from "@/lib/domain-config";
import { getTierLabel, domainKeyToHouse } from "@/lib/detail-helpers";

// ─── Types (mirrors CapsuleDetailSheet) ──────────────────
interface CapsuleData {
  id: string;
  phases: {
    id: string;
    domain: string;
    title: string;
    subtitle: string;
    description: string;
    intensity: number;
    score?: number;
    planets: PlanetKey[];
    status: string;
    keyInsight?: string;
    peakMoment?: string;
    guidance?: string;
    color?: string;
    startDate: string;
    endDate?: string;
    durationWeeks: number;
    apiLabel?: string;
    apiCategory?: string;
    transitPlanet?: string;
    natalPoint?: string;
    aspect?: string;
    cycle?: { hitNumber: number; totalHits: number; pattern: string; allHits: { date: string; hitNumber: number }[] };
    apiTopics?: { house: number; color: string; topic: string; source: string }[];
    lotType?: string;
    zrLevel?: number;
    periodSign?: string;
    markers?: string[];
    eclipseType?: string;
    lifetimeNumber?: number;
    lifetimeTotal?: number;
    isVipTransit?: boolean;
  }[];
  domains: { domain: string; intensity: number; occurrence: number; totalOccurrences: number }[];
  planets: PlanetKey[];
  startDate: Date;
  endDate: Date;
  lane: number;
  tier: "toc" | "toctoc" | "toctoctoc";
  tierOccurrence: number;
  tierTotal: number;
  isCurrent: boolean;
  isFuture: boolean;
  color?: string;
}

const MONTH_NAMES = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

const SHARE_URL = "https://unfold.app/?utm_source=share&utm_medium=signal";

// ─── Tier glow colors ────────────────────────────────────
function getTierGlow(tier: CapsuleData["tier"]): string {
  if (tier === "toctoctoc") return "rgba(155, 133, 196, 0.5)";
  if (tier === "toctoc") return "rgba(155, 133, 196, 0.3)";
  return "rgba(155, 133, 196, 0.15)";
}

// ─── Main Component ──────────────────────────────────────
export function ShareSignalCard({
  capsule,
  onClose,
}: {
  capsule: CapsuleData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const phase = capsule.phases[0];
  const tierLabel = getTierLabel(capsule.tier);
  const domain = phase?.domain ?? "work";
  const house = domainKeyToHouse(domain);
  const houseMeta = houseConfig[house];
  const houseColor = capsule.color ?? houseMeta?.color ?? "#9B85C4";

  // Date labels
  const startLabel = `${capsule.startDate.getDate()} ${MONTH_NAMES[capsule.startDate.getMonth()]} ${capsule.startDate.getFullYear()}`;
  const endLabel = `${capsule.endDate.getDate()} ${MONTH_NAMES[capsule.endDate.getMonth()]} ${capsule.endDate.getFullYear()}`;

  // Display text: AI subtitle first, then phase title
  const displayText = phase?.subtitle || phase?.title || "";

  // Share handler
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Unfold — ${tierLabel}`,
          text: displayText,
          url: SHARE_URL,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled or API unavailable — fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [tierLabel, displayText]);

  // Copy handler
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-[60] flex items-end justify-center"
        style={{ background: "rgba(10, 6, 20, 0.75)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="w-full max-w-[340px] mx-auto mb-6 flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── The Card ── */}
          <div
            className="relative overflow-hidden"
            style={{
              width: 300,
              height: 533,
              borderRadius: 24,
              background: "linear-gradient(165deg, #1B1535 0%, #2A1F4E 55%, #1B1535 100%)",
              border: "1px solid rgba(155, 133, 196, 0.15)",
              boxShadow: "0 24px 64px rgba(10, 6, 20, 0.6), 0 0 0 1px rgba(155, 133, 196, 0.08)",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 280,
                height: 280,
                background: `radial-gradient(circle, ${getTierGlow(capsule.tier)} 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            {/* Top: Branding */}
            <div className="relative flex items-center gap-2 px-6 pt-6">
              <div
                className="h-5 w-5 rounded-full"
                style={{
                  background: "linear-gradient(135deg, #9B85C4 0%, #7C6BBF 100%)",
                  boxShadow: "0 0 12px rgba(124, 107, 191, 0.4)",
                }}
              />
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{ color: "rgba(195, 185, 215, 0.7)" }}
              >
                unfold.app
              </span>
            </div>

            {/* Center: Signal content */}
            <div className="relative flex flex-col items-center justify-center px-6" style={{ marginTop: 64 }}>
              {/* Tier badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{
                  background: `color-mix(in srgb, ${houseColor} 12%, rgba(27, 21, 53, 0.8))`,
                  border: `1px solid color-mix(in srgb, ${houseColor} 25%, transparent)`,
                  boxShadow: `0 0 20px ${getTierGlow(capsule.tier)}`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: houseColor,
                    boxShadow: `0 0 8px ${houseColor}`,
                  }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: houseColor }}
                >
                  {tierLabel}
                </span>
              </div>

              {/* Planet pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {capsule.planets.slice(0, 3).map((planet) => {
                  const pc = planetConfig[planet];
                  const isSolarEclipse = planet === "solar-eclipse";
                  return (
                    <div
                      key={planet}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{
                        background: `color-mix(in srgb, ${pc.color} 10%, rgba(27, 21, 53, 0.6))`,
                        border: `1px solid color-mix(in srgb, ${pc.color} 20%, transparent)`,
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: isSolarEclipse
                            ? "linear-gradient(135deg, #1a1a1a 45%, #C9A86C 55%)"
                            : pc.color,
                          boxShadow: `0 0 6px ${pc.color}`,
                        }}
                      />
                      <span className="text-[10px] font-medium" style={{ color: pc.color }}>
                        {pc.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Signal text */}
              {displayText && (
                <p
                  className="text-center text-sm leading-relaxed font-medium px-2 mb-5"
                  style={{
                    color: "rgba(225, 218, 240, 0.9)",
                    maxHeight: 80,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {displayText}
                </p>
              )}

              {/* Date range */}
              <span
                className="text-[10px] tabular-nums tracking-wide"
                style={{ color: "rgba(195, 185, 215, 0.45)" }}
              >
                {startLabel} — {endLabel}
              </span>
            </div>

            {/* Bottom: CTA */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 pb-6 pt-10"
              style={{
                background: "linear-gradient(to top, rgba(27, 21, 53, 0.95) 40%, transparent 100%)",
              }}
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: "rgba(195, 185, 215, 0.6)" }}
              >
                Quel est ton rythme ?
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: "#9B85C4" }}
              >
                unfold.app
              </span>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 w-full max-w-[300px]">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all duration-200"
              style={{
                background: "rgba(155, 133, 196, 0.15)",
                border: "1px solid rgba(155, 133, 196, 0.2)",
                color: "#C3B9D7",
              }}
            >
              <ShareNodes size={16} />
              <span className="text-[12px] font-medium">
                {shared ? "Partage en cours..." : "Partager"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all duration-200"
              style={{
                background: copied
                  ? "rgba(124, 107, 191, 0.25)"
                  : "rgba(155, 133, 196, 0.08)",
                border: `1px solid ${copied ? "rgba(124, 107, 191, 0.4)" : "rgba(155, 133, 196, 0.12)"}`,
                color: copied ? "#9B85C4" : "rgba(195, 185, 215, 0.6)",
              }}
            >
              {copied ? <ClipboardCheck size={16} /> : <Link size={16} />}
              <span className="text-[12px] font-medium">
                {copied ? "Copie !" : "Copier le lien"}
              </span>
            </button>
          </div>

          {/* ── Close button ── */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-10 w-10 rounded-full transition-colors duration-200"
            style={{
              background: "rgba(155, 133, 196, 0.08)",
              border: "1px solid rgba(155, 133, 196, 0.1)",
              color: "rgba(195, 185, 215, 0.5)",
            }}
          >
            <Close size={18} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
