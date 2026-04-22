"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { PlanetPill, TierBadge, EyebrowLabel } from "@/components/demo/primitives";
import { fetchConnectionBrief, type ActivePeriod } from "@/lib/connection-brief-api";
import {
  getConnectionDelineation,
  type ConnectionDelineation,
} from "@/lib/connection-delineation";
import type { MatchingWindow, RelationshipType } from "@/lib/matching-narratives";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { relationshipConfig } from "./relationshipConfig";

interface ConnectionReportProps {
  connection: RealConnection;
  myBirthData: BirthData | null;
  /** When true, suppress the scroll container wrapper so a parent pager can manage scroll. */
  embedded?: boolean;
}

/**
 * The scrolling body of a connection detail — one stack of WindowCards.
 * Extracted from app/demo/compatibility/[connectionId]/page.tsx so it can be
 * rendered standalone OR inside ConnectionCarousel for swipeable detail.
 */
export function ConnectionReport({ connection, myBirthData, embedded }: ConnectionReportProps) {
  const [windows, setWindows] = useState<MatchingWindow[]>([]);
  const [periods, setPeriods] = useState<ActivePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (myBirthData && connection.birthData) {
        try {
          const result = await fetchConnectionBrief(
            myBirthData,
            connection.birthData,
            connection.relationship as RelationshipType,
            connection.name,
          );
          if (!cancelled && result.windows.length > 0) {
            setWindows(result.windows);
            setPeriods(result.periods);
            setHasData(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("[ConnectionReport] brief error:", err);
        }
      }
      if (!cancelled) {
        setWindows([]);
        setPeriods([]);
        setHasData(false);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [connection.id, connection.birthData, connection.name, connection.relationship, myBirthData]);

  const rel = relationshipConfig[connection.relationship];

  const body = (() => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center py-20">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--accent-purple)",
              borderRightColor: "var(--accent-purple)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!hasData) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <p className="text-sm text-text-body">
            {connection.birthData
              ? "Pas assez de données pour comparer vos rythmes."
              : `${connection.name} n'a pas encore partagé ses données de naissance.`}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {windows.map((w, i) => (
          <WindowCard
            key={w.monthKey}
            w={w}
            period={periods[i]}
            i={i}
            relColor={rel.color}
            theirName={connection.name}
            myBirthData={myBirthData}
            theirBirthData={connection.birthData}
          />
        ))}
        <div className="h-4" />
      </div>
    );
  })();

  if (embedded) return body;
  return <div className="flex min-h-0 flex-col">{body}</div>;
}

// ─── WindowCard (unchanged from previous detail page) ────

function WindowCard({
  w,
  period,
  i,
  relColor,
  theirName,
  myBirthData,
  theirBirthData,
}: {
  w: MatchingWindow;
  period: ActivePeriod;
  i: number;
  relColor: string;
  theirName: string;
  myBirthData: BirthData | null;
  theirBirthData: BirthData;
}) {
  const [del, setDel] = useState<ConnectionDelineation | null>(null);
  const [delLoading, setDelLoading] = useState(true);

  useEffect(() => {
    if (!myBirthData) return;
    getConnectionDelineation(
      period,
      w.relationship,
      {
        birthDate: myBirthData.birthDate,
        birthTime: myBirthData.birthTime,
        latitude: myBirthData.latitude,
        longitude: myBirthData.longitude,
      },
      {
        birthDate: theirBirthData.birthDate,
        birthTime: theirBirthData.birthTime,
        latitude: theirBirthData.latitude,
        longitude: theirBirthData.longitude,
      },
    )
      .then(setDel)
      .finally(() => setDelLoading(false));
  }, [period, w.relationship, myBirthData, theirBirthData]);

  const isActive = w.status === "active";

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--surface-subtle)",
        border: `1px solid color-mix(in srgb, ${w.tierColor} ${isActive ? "25" : "12"}%, transparent)`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.05 }}
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
        <h3 className="text-base font-bold text-text-heading mt-1">
          {del ? del.ensemble.titre : w.title}
        </h3>
        <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

        <div
          className="mt-3 rounded-xl px-3.5 py-2.5"
          style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
        >
          {delLoading ? (
            <div
              className="h-3 rounded animate-pulse w-3/4"
              style={{ background: `color-mix(in srgb, ${w.tierColor} 20%, transparent)` }}
            />
          ) : (
            <p className="text-xs font-semibold text-text-heading">
              {del ? del.ensemble.pourquoiCeMois : w.sharedTheme}
            </p>
          )}
        </div>

        {del && (
          <p className="mt-2 text-[11px] italic text-text-body-subtle leading-relaxed">
            {del.ensemble.dynamique}
          </p>
        )}

        <div className="mt-3 space-y-2">
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
            <div className="flex items-start justify-between gap-2">
              <EyebrowLabel color="var(--accent-purple)" className="mb-1">
                Vous
              </EyebrowLabel>
              {del && (
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
                  style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                >
                  {del.personA.titre}
                </span>
              )}
            </div>
            {delLoading ? (
              <div className="space-y-1">
                <div className="h-2.5 rounded animate-pulse w-full" style={{ background: "var(--surface-medium)" }} />
                <div className="h-2.5 rounded animate-pulse w-4/5" style={{ background: "var(--surface-medium)" }} />
              </div>
            ) : (
              <>
                <p className="text-xs text-text-body leading-relaxed">
                  {del ? del.personA.corps : w.you.description}
                </p>
                {del && (
                  <p className="mt-1.5 text-[10px] text-text-body-subtle italic leading-snug">
                    {del.personA.defi}
                  </p>
                )}
              </>
            )}
            <PlanetPill planet={w.you.planet} className="mt-1.5" />
          </div>

          <div className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
            <div className="flex items-start justify-between gap-2">
              <EyebrowLabel color={relColor} className="mb-1">
                {theirName}
              </EyebrowLabel>
              {del && (
                <span
                  className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
                  style={{ color: relColor, opacity: 0.5 }}
                >
                  {del.personB.titre}
                </span>
              )}
            </div>
            {delLoading ? (
              <div className="space-y-1">
                <div className="h-2.5 rounded animate-pulse w-full" style={{ background: "var(--surface-medium)" }} />
                <div className="h-2.5 rounded animate-pulse w-4/5" style={{ background: "var(--surface-medium)" }} />
              </div>
            ) : (
              <>
                <p className="text-xs text-text-body leading-relaxed">
                  {del ? del.personB.corps : w.them.description}
                </p>
                {del && (
                  <p className="mt-1.5 text-[10px] text-text-body-subtle italic leading-snug">
                    {del.personB.defi}
                  </p>
                )}
              </>
            )}
            <PlanetPill planet={w.them.planet} className="mt-1.5" />
          </div>
        </div>

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
          {delLoading ? (
            <div className="space-y-1">
              <div className="h-2.5 rounded animate-pulse w-full" style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
              <div className="h-2.5 rounded animate-pulse w-3/5" style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
            </div>
          ) : (
            <p className="text-xs text-text-heading font-medium leading-relaxed">
              {del ? del.ensemble.aFaireEnsemble : w.action}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
