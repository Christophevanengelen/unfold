"use client";

import { useParams } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { mockConnections } from "@/lib/mock-data";
import { planetConfig, type PlanetKey } from "@/lib/domain-config";

// Timing windows — shared momentum periods between two people
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

const MOCK_WINDOWS: Record<string, TimingWindow[]> = {
  conn_jordan: [
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
      insight: "Align on money, investments, or shared projects. Timing supports practical decisions.",
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
  ],
  conn_sam: [
    {
      title: "Energy alignment",
      dateRange: "Apr 20 \u2014 May 30",
      daysLeft: 30,
      status: "active",
      tier: "CLEAR",
      tierColor: "#6BA89A",
      you: { description: "Mars boosts your vitality", planet: "mars" },
      them: { description: "Sun energizes their daily rhythm", planet: "sun" },
      insight: "Great window for outdoor activities or starting a fitness goal together.",
    },
    {
      title: "Social expansion",
      dateRange: "Oct 5 \u2014 Nov 10",
      daysLeft: 198,
      status: "upcoming",
      tier: "CLEAR",
      tierColor: "#9585CC",
      you: { description: "Jupiter opens your network zone", planet: "jupiter" },
      them: { description: "Mercury sharpens their communication", planet: "mercury" },
      insight: "Host something. Your combined energy draws the right people in.",
    },
  ],
  conn_maya: [
    {
      title: "Professional momentum",
      dateRange: "Apr 1 \u2014 May 15",
      daysLeft: 11,
      status: "active",
      tier: "PEAK",
      tierColor: "#B07CC2",
      you: { description: "Sun highlights your career house", planet: "sun" },
      them: { description: "Saturn reinforces their authority", planet: "saturn" },
      insight: "Schedule the important meeting. Both charts support high-stakes moves.",
    },
    {
      title: "Creative brainstorm",
      dateRange: "Aug 10 \u2014 Sep 5",
      daysLeft: 142,
      status: "upcoming",
      tier: "CLEAR",
      tierColor: "#50C4D6",
      you: { description: "Mercury sharpens your ideas", planet: "mercury" },
      them: { description: "Uranus sparks their innovation", planet: "uranus" },
      insight: "Book a brainstorm session. Ideas will flow faster than usual.",
    },
  ],
};

const relationshipColors: Record<string, string> = {
  partner: "#D89EA0",
  friend: "#50C4D6",
  family: "#6BA89A",
  colleague: "#9585CC",
};

export default function ConnectionDetailPage() {
  const params = useParams();
  const connectionId = params.connectionId as string;
  const connection = mockConnections.find((c) => c.id === connectionId);
  const windows = MOCK_WINDOWS[connectionId];

  if (!connection || !windows) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">Connection not found</p>
      </div>
    );
  }

  const relColor = relationshipColors[connection.relationship] ?? "#9585CC";
  const activeCount = windows.filter(w => w.status === "active").length;
  const totalCount = windows.length;

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
            {totalCount} timing window{totalCount > 1 ? "s" : ""} active or upcoming
          </p>
        </div>
      </div>

      {/* Timing windows */}
      <div className="space-y-4">
        {windows.map((w, i) => {
          const youPlanet = planetConfig[w.you.planet];
          const themPlanet = planetConfig[w.them.planet];
          const isActive = w.status === "active";

          return (
            <motion.div
              key={w.title}
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
                {/* Title + date */}
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

              {/* Tier badge */}
              {isActive && (
                <div className="flex items-center justify-end px-4 pb-3">
                  <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider" style={{ color: w.tierColor }}>
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: w.tierColor }} />
                    {w.tier}
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
