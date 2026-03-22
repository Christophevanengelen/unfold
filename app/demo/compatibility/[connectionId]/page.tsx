"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockConnections } from "@/lib/mock-data";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";
import { useMomentum } from "@/lib/momentum-store";
import { fetchYearData, type MonthData, type ApiEvent } from "@/lib/momentum-api";
import type { BirthData } from "@/lib/birth-data";

// ─── Types ──────────────────────────────────────────────────

interface TimingWindow {
  title: string;
  dateRange: string;
  daysLeft: number;
  status: "active" | "upcoming";
  tier: "SUBTLE" | "CLEAR" | "PEAK";
  tierColor: string;
  you: { description: string; planet: PlanetKey };
  them: { description: string; planet: PlanetKey };
  insight: string;
}

// ─── Helpers ────────────────────────────────────────────────

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function eventToPlanet(ev: ApiEvent): PlanetKey {
  const map: Record<string, PlanetKey> = {
    "Pluto": "neptune", "Neptune": "neptune", "Uranus": "uranus",
    "Saturn": "saturn", "Jupiter": "jupiter", "Mars": "mars",
    "Venus": "venus", "Mercury": "mercury", "Sun": "sun", "Moon": "moon",
  };
  // Extract planet name from event type (e.g. "Saturn square natal Moon" -> "Saturn")
  const firstWord = ev.label?.split(" ")[0] ?? "";
  // Try category-based mapping
  if (ev.category === "zr") return "jupiter"; // ZR = fortune/destiny
  if (ev.category === "eclipse") return "moon";
  // Try from label
  for (const [name, key] of Object.entries(map)) {
    if (ev.label?.includes(name)) return key;
  }
  return "sun";
}

function eventToTitle(ev: ApiEvent): string {
  if (ev.category === "zr") {
    if (ev.lotType === "fortune") return "Circumstances shift";
    if (ev.lotType === "spirit") return "Vocation activates";
    if (ev.lotType === "eros") return "Desire intensifies";
    return "Life peak";
  }
  if (ev.category === "eclipse") return "Eclipse reset";
  // Transit/station: simplify
  const type = ev.label ?? "Signal active";
  return type.length > 40 ? type.slice(0, 37) + "..." : type;
}

function eventToInsight(titleA: string, titleB: string): string {
  return `Both charts are active. Your timing aligns for the next few weeks.`;
}

function getTierFromScore(score: number): { tier: "SUBTLE" | "CLEAR" | "PEAK"; color: string } {
  if (score >= 3) return { tier: "PEAK", color: "#D89EA0" };
  if (score >= 2) return { tier: "CLEAR", color: "#6BA89A" };
  return { tier: "SUBTLE", color: "#8B7FC2" };
}

/** Compare two year-data month arrays to find overlapping active months */
function compareTimelines(
  monthsA: MonthData[],
  monthsB: MonthData[],
): TimingWindow[] {
  const windows: TimingWindow[] = [];
  const today = new Date();

  for (const mA of monthsA) {
    if (!mA.topEvents?.length) continue;
    const mB = monthsB.find(m => m.month === mA.month);
    if (!mB?.topEvents?.length) continue;

    // Both have events this month = shared window
    const topA = mA.topEvents.sort((a, b) => b.score - a.score)[0];
    const topB = mB.topEvents.sort((a, b) => b.score - a.score)[0];
    const maxScore = Math.max(topA.score, topB.score);
    const { tier, color } = getTierFromScore(maxScore);

    const [year, month] = mA.month.split("-").map(Number);
    const monthDate = new Date(year, month - 1, 15);
    const daysLeft = Math.max(0, Math.round((monthDate.getTime() - today.getTime()) / (86400000)));
    const isActive = daysLeft < 30 && monthDate.getMonth() === today.getMonth() && monthDate.getFullYear() === today.getFullYear();

    const planetA = eventToPlanet(topA);
    const planetB = eventToPlanet(topB);

    windows.push({
      title: isActive ? "Momentum alignment" : `${MONTH_NAMES[month - 1]} alignment`,
      dateRange: `${MONTH_NAMES[month - 1]} ${year}`,
      daysLeft,
      status: isActive ? "active" : "upcoming",
      tier,
      tierColor: color,
      you: { description: eventToTitle(topA), planet: planetA },
      them: { description: eventToTitle(topB), planet: planetB },
      insight: eventToInsight(eventToTitle(topA), eventToTitle(topB)),
    });
  }

  // Sort: active first, then by daysLeft
  return windows
    .sort((a, b) => (a.status === "active" ? -1 : 1) - (b.status === "active" ? -1 : 1) || a.daysLeft - b.daysLeft)
    .slice(0, 5); // max 5 windows
}

// ─── Fallback mock data (when API unavailable) ──────────────

const FALLBACK_WINDOWS: TimingWindow[] = [
  {
    title: "Relationship deepening",
    dateRange: "Mar 8 \u2014 Apr 15, 2026",
    daysLeft: 25,
    status: "active",
    tier: "PEAK",
    tierColor: "#D89EA0",
    you: { description: "Jupiter activates your partnership house", planet: "jupiter" },
    them: { description: "Venus enters their commitment zone", planet: "venus" },
    insight: "Have the conversation you've been postponing. Both charts say: now.",
  },
  {
    title: "Financial planning",
    dateRange: "Jun 1 \u2014 Jul 12",
    daysLeft: 72,
    status: "upcoming",
    tier: "CLEAR",
    tierColor: "#6BA89A",
    you: { description: "Saturn structures your resources", planet: "saturn" },
    them: { description: "Jupiter expands their shared assets", planet: "jupiter" },
    insight: "Align on money, investments, or shared projects.",
  },
  {
    title: "Reconnection wave",
    dateRange: "Sep 15 \u2014 Oct 28",
    daysLeft: 178,
    status: "upcoming",
    tier: "PEAK",
    tierColor: "#D89EA0",
    you: { description: "Venus returns to your love sector", planet: "venus" },
    them: { description: "Moon activates their emotional core", planet: "moon" },
    insight: "Plan a trip or meaningful experience together. This window is rare.",
  },
];

// ─── Relationship colors ────────────────────────────────────

const relationshipColors: Record<string, string> = {
  partner: "#D89EA0",
  friend: "#50C4D6",
  family: "#6BA89A",
  colleague: "#9585CC",
};

// ─── Component ──────────────────────────────────────────────

export default function ConnectionDetailPage() {
  const params = useParams();
  const connectionId = params.connectionId as string;
  const connection = mockConnections.find((c) => c.id === connectionId);
  const { birthData: myBirthData } = useMomentum();

  const [windows, setWindows] = useState<TimingWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!connection) return;

    async function loadComparison() {
      setLoading(true);

      // If both have birth data, call real API
      if (myBirthData && connection!.birthData) {
        try {
          const theirBirth: BirthData = {
            nickname: connection!.name,
            birthDate: connection!.birthData.birthDate,
            birthTime: connection!.birthData.birthTime,
            latitude: connection!.birthData.latitude,
            longitude: connection!.birthData.longitude,
            timezone: connection!.birthData.timezone,
            placeOfBirth: "",
          };

          const [myYear, theirYear] = await Promise.all([
            fetchYearData(myBirthData),
            fetchYearData(theirBirth),
          ]);

          if (myYear?.data?.months && theirYear?.data?.months) {
            const compared = compareTimelines(myYear.data.months, theirYear.data.months);
            if (compared.length > 0) {
              setWindows(compared);
              setIsLive(true);
              setLoading(false);
              return;
            }
          }
        } catch (err) {
          console.error("[Compatibility] API error:", err);
        }
      }

      // Fallback to mock
      setWindows(FALLBACK_WINDOWS);
      setIsLive(false);
      setLoading(false);
    }

    loadComparison();
  }, [connection, myBirthData]);

  if (!connection) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">Connection not found</p>
      </div>
    );
  }

  const relColor = relationshipColors[connection.relationship] ?? "#9585CC";

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-none px-4 py-2">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4">
        <Link href="/demo/compatibility" className="text-text-body-subtle">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="text-sm font-semibold text-text-heading">Alex & {connection.name}</p>
          <p className="text-[10px] text-text-body-subtle">
            {loading ? "Comparing timelines..." : `${windows.length} timing window${windows.length !== 1 ? "s" : ""} ${isLive ? "" : "(demo)"}`}
          </p>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-1 items-center justify-center">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Timing windows */}
      {!loading && (
        <div className="space-y-4">
          {windows.map((w, i) => {
            const youPlanet = planetConfig[w.you.planet];
            const themPlanet = planetConfig[w.them.planet];
            const isActive = w.status === "active";

            return (
              <motion.div
                key={`${w.title}-${i}`}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "color-mix(in srgb, var(--accent-purple) 5%, transparent)",
                  border: `1px solid color-mix(in srgb, ${w.tierColor} ${isActive ? "25" : "12"}%, transparent)`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.12 }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: isActive ? w.tierColor : "var(--text-body-subtle)", opacity: isActive ? 1 : 0.4 }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isActive ? w.tierColor : "var(--text-body-subtle)" }}>
                      {isActive ? "Active now" : "Coming up"}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-body-subtle">
                    {w.daysLeft} days {isActive ? "left" : ""}
                  </span>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-base font-bold text-text-heading mt-1">{w.title}</h3>
                  <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

                  {/* You + Them */}
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-purple mb-1">You</p>
                      <p className="text-xs text-text-body">{w.you.description}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `color-mix(in srgb, ${youPlanet.color} 15%, transparent)`, color: youPlanet.color }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: youPlanet.color }} />
                        {youPlanet.label}
                      </span>
                    </div>

                    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: relColor }}>Them</p>
                      <p className="text-xs text-text-body">{w.them.description}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `color-mix(in srgb, ${themPlanet.color} 15%, transparent)`, color: themPlanet.color }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: themPlanet.color }} />
                        {themPlanet.label}
                      </span>
                    </div>
                  </div>

                  {/* Insight */}
                  <div className="mt-3 rounded-xl px-3.5 py-2.5"
                    style={{ background: `color-mix(in srgb, ${w.tierColor} 6%, transparent)` }}>
                    <p className="text-xs text-text-body leading-relaxed">{w.insight}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
