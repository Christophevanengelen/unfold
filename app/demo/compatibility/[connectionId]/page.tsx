"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { mockConnections } from "@/lib/mock-data";
import { PageHeader, PlanetPill, TierBadge, EyebrowLabel } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { fetchYearData } from "@/lib/momentum-api";
import type { BirthData } from "@/lib/birth-data";
import {
  compareTimelines,
  type MatchingWindow,
  type RelationshipType,
} from "@/lib/matching-narratives";

// ─── Relationship colors ────────────────────────────────

const relationshipColors: Record<string, string> = {
  partner: "#D89EA0",
  friend: "#50C4D6",
  family: "#6BA89A",
  colleague: "#9585CC",
};

const relationshipLabels: Record<string, string> = {
  partner: "Partenaire",
  friend: "Ami·e",
  family: "Famille",
  colleague: "Collègue",
};

// ─── Component ──────────────────────────────────────────

export default function ConnectionDetailPage() {
  const params = useParams();
  const connectionId = params.connectionId as string;
  const connection = mockConnections.find((c) => c.id === connectionId);
  const { birthData: myBirthData } = useMomentum();

  const [windows, setWindows] = useState<MatchingWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!connection) return;

    async function loadComparison() {
      setLoading(true);

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
            const compared = compareTimelines(
              myYear.data.months,
              theirYear.data.months,
              connection!.relationship as RelationshipType,
              connection!.name,
            );
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

      // No API data available
      setWindows([]);
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
    <div className="flex flex-col">
      <PageHeader
        backHref="/demo/compatibility"
        title={`Vous & ${connection.name}`}
        subtitle={
          loading
            ? "Comparaison en cours..."
            : isLive
              ? `${windows.length} fenêtre${windows.length !== 1 ? "s" : ""} de timing`
              : "Données insuffisantes"
        }
        leadingSlot={
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: relColor }}
          >
            {connection.initial}
          </div>
        }
      />

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

      {/* Empty state */}
      {!loading && windows.length === 0 && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
          <div className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ background: "var(--surface-medium)" }}>
            <span className="text-lg" style={{ color: "var(--accent-purple)" }}>?</span>
          </div>
          <p className="text-sm text-text-body">
            {connection.birthData
              ? "Pas assez de données pour comparer vos rythmes pour le moment."
              : `${connection.name} n'a pas encore partagé ses données de naissance.`}
          </p>
        </div>
      )}

      {/* Timing windows */}
      {!loading && windows.length > 0 && (
        <div className="space-y-4">
          {windows.map((w, i) => {
            const isActive = w.status === "active";

            return (
              <motion.div
                key={`${w.monthKey}-${i}`}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "var(--surface-subtle)",
                  border: `1px solid color-mix(in srgb, ${w.tierColor} ${isActive ? "25" : "12"}%, transparent)`,
                }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1 }}
              >
                {/* Status bar */}
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{
                        backgroundColor: isActive ? w.tierColor : "var(--text-body-subtle)",
                        opacity: isActive ? 1 : 0.4,
                      }}
                    />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: isActive ? w.tierColor : "var(--text-body-subtle)" }}
                    >
                      {isActive ? "Actif maintenant" : w.status === "past" ? "Passé" : "À venir"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TierBadge tier={w.tier} color={w.tierColor} />
                    <span className="text-[10px] text-text-body-subtle">
                      {isActive ? `${w.daysLeft}j restants` : w.status === "past" ? "" : `dans ${w.daysLeft}j`}
                    </span>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <h3 className="text-base font-bold text-text-heading mt-1">{w.title}</h3>
                  <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

                  {/* Shared theme */}
                  <div
                    className="mt-3 rounded-xl px-3.5 py-2.5"
                    style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
                  >
                    <p className="text-xs font-semibold text-text-heading">{w.sharedTheme}</p>
                  </div>

                  {/* You + Them */}
                  <div className="mt-3 space-y-2">
                    <div
                      className="rounded-xl px-3.5 py-2.5"
                      style={{ background: "var(--surface-light)" }}
                    >
                      <EyebrowLabel color="var(--accent-purple)" className="mb-1">Vous</EyebrowLabel>
                      <p className="text-xs text-text-body leading-relaxed">{w.you.description}</p>
                      <PlanetPill planet={w.you.planet} className="mt-1.5" />
                    </div>

                    <div
                      className="rounded-xl px-3.5 py-2.5"
                      style={{ background: "var(--surface-light)" }}
                    >
                      <EyebrowLabel color={relColor} className="mb-1">{connection.name}</EyebrowLabel>
                      <p className="text-xs text-text-body leading-relaxed">{w.them.description}</p>
                      <PlanetPill planet={w.them.planet} className="mt-1.5" />
                    </div>
                  </div>

                  {/* Insight */}
                  <div
                    className="mt-3 rounded-xl px-3.5 py-2.5"
                    style={{ background: `color-mix(in srgb, ${w.tierColor} 6%, transparent)` }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-body-subtle mb-1">
                      Pourquoi ce mois compte
                    </p>
                    <p className="text-xs text-text-body leading-relaxed">{w.insight}</p>
                  </div>

                  {/* Action */}
                  <div
                    className="mt-2 rounded-xl px-3.5 py-2.5"
                    style={{
                      background: `color-mix(in srgb, ${w.tierColor} 10%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${w.tierColor} 15%, transparent)`,
                    }}
                  >
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: w.tierColor }}>
                      À faire ensemble
                    </p>
                    <p className="text-xs text-text-heading font-medium leading-relaxed">{w.action}</p>
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
