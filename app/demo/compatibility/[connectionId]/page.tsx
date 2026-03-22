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

const MONTH_NAMES_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];

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
    if (ev.lotType === "fortune") return "Vos circonstances bougent";
    if (ev.lotType === "spirit") return "Votre direction se clarifie";
    if (ev.lotType === "eros") return "L\u2019attraction s\u2019intensifie";
    return "Pic d\u2019\u00e9nergie";
  }
  if (ev.category === "eclipse") return "Tournant \u00e9motionnel";
  // Transit/station: translate to French
  const type = ev.label ?? "Signal actif";
  const translated = translateTransitLabel(type);
  return translated.length > 40 ? translated.slice(0, 37) + "..." : translated;
}

function translateTransitLabel(label: string): string {
  const planetMap: Record<string, string> = {
    "Pluto": "Pluton", "Neptune": "Neptune", "Uranus": "Uranus",
    "Saturn": "Saturne", "Jupiter": "Jupiter", "Mars": "Mars",
    "Venus": "V\u00e9nus", "Mercury": "Mercure", "Sun": "Soleil", "Moon": "Lune",
  };
  const aspectMap: Record<string, string> = {
    "conjunction": "conjonction", "square": "carr\u00e9",
    "opposition": "opposition", "trine": "trigone",
  };

  let result = label;
  for (const [en, fr] of Object.entries(planetMap)) {
    result = result.replaceAll(en, fr);
  }
  for (const [en, fr] of Object.entries(aspectMap)) {
    result = result.replaceAll(en, fr);
  }
  result = result.replaceAll("natal", "natal");
  return result;
}

function eventToInsight(titleA: string, titleB: string): string {
  return `Vos rythmes s\u2019alignent. C\u2019est le bon moment pour agir ensemble.`;
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
      title: isActive ? "Alignement de rythmes" : `Alignement ${MONTH_NAMES_FR[month - 1]}`,
      dateRange: `${MONTH_NAMES_FR[month - 1]} ${year}`,
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
    title: "Rapprochement",
    dateRange: "8 Mar \u2014 15 Avr 2026",
    daysLeft: 25,
    status: "active",
    tier: "PEAK",
    tierColor: "#D89EA0",
    you: { description: "Une envie de vous engager plus profond\u00e9ment", planet: "jupiter" },
    them: { description: "Un besoin de stabilit\u00e9 et d\u2019engagement", planet: "venus" },
    insight: "C\u2019est le moment d\u2019avoir la conversation que vous repoussez.",
  },
  {
    title: "Organisation financi\u00e8re",
    dateRange: "1 Jun \u2014 12 Jul",
    daysLeft: 72,
    status: "upcoming",
    tier: "CLEAR",
    tierColor: "#6BA89A",
    you: { description: "Un besoin de structurer vos ressources", planet: "saturn" },
    them: { description: "Une envie d\u2019investir ensemble", planet: "jupiter" },
    insight: "Alignez-vous sur l\u2019argent, les projets communs ou les investissements.",
  },
  {
    title: "Vague de reconnexion",
    dateRange: "15 Sep \u2014 28 Oct",
    daysLeft: 178,
    status: "upcoming",
    tier: "PEAK",
    tierColor: "#D89EA0",
    you: { description: "L\u2019attraction et la douceur reviennent", planet: "venus" },
    them: { description: "Les \u00e9motions profondes s\u2019ouvrent", planet: "moon" },
    insight: "Planifiez un moment fort ensemble. Cette fen\u00eatre est rare.",
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
        <p className="text-sm text-text-body-subtle">Connexion introuvable</p>
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
          <p className="text-sm font-semibold text-text-heading">Vous & {connection.name}</p>
          <p className="text-[10px] text-text-body-subtle">
            {loading ? "Comparaison en cours..." : `${windows.length} fen\u00eatre${windows.length !== 1 ? "s" : ""} de timing ${isLive ? "" : "(d\u00e9mo)"}`}
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
                      {isActive ? "Actif maintenant" : "\u00c0 venir"}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-body-subtle">
                    {w.daysLeft} jours{isActive ? " restants" : ""}
                  </span>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-base font-bold text-text-heading mt-1">{w.title}</h3>
                  <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

                  {/* Vous + Connection name */}
                  <div className="mt-3 space-y-2">
                    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-accent-purple mb-1">Vous</p>
                      <p className="text-xs text-text-body">{w.you.description}</p>
                      <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium"
                        style={{ background: `color-mix(in srgb, ${youPlanet.color} 15%, transparent)`, color: youPlanet.color }}>
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: youPlanet.color }} />
                        {youPlanet.label}
                      </span>
                    </div>

                    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)" }}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: relColor }}>{connection.name}</p>
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
