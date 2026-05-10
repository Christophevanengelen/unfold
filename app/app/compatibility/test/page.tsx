"use client";

/**
 * /demo/compatibility/test
 * Live demo of connection-brief + LLM delineation.
 * personA = 24-10-1980 01:41 Brussels
 * personB = 02-09-1982 02:15 Antwerp · partner
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { ArrowLeft } from "flowbite-react-icons/outline";
import { PlanetPill, TierBadge, EyebrowLabel } from "@/components/demo/primitives";
import { fetchConnectionBrief, type ActivePeriod } from "@/lib/connection-brief-api";
import { getConnectionDelineation, type ConnectionDelineation } from "@/lib/connection-delineation";
import type { MatchingWindow } from "@/lib/matching-narratives";

// ─── Test birth data ─────────────────────────────────────

const PERSON_A = {
  nickname: "Moi",
  birthDate: "1980-10-24",
  birthTime: "01:41",
  latitude: 50.8503,
  longitude: 4.3517,
  timezone: "Europe/Brussels",
  placeOfBirth: "Brussels",
};

const PERSON_B = {
  nickname: "Partenaire",
  birthDate: "1982-09-02",
  birthTime: "02:15",
  latitude: 51.2213,
  longitude: 4.4051,
  timezone: "Europe/Brussels",
  placeOfBirth: "Antwerp",
};

const REL_COLOR = "#D89EA0";

// ─── Card with delineation ───────────────────────────────

function WindowCard({
  w,
  period,
  i,
}: {
  w: MatchingWindow;
  period: ActivePeriod;
  i: number;
}) {
  const [del, setDel] = useState<ConnectionDelineation | null>(null);
  const [delLoading, setDelLoading] = useState(true);

  useEffect(() => {
    getConnectionDelineation(
      period,
      "partner",
      PERSON_A.birthDate,
      PERSON_B.birthDate,
    )
      .then(setDel)
      .finally(() => setDelLoading(false));
  }, [period]);

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
      transition={{ delay: i * 0.1 }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: isActive ? w.tierColor : "var(--text-body-subtle)", opacity: isActive ? 1 : 0.4 }}
          />
          <span className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: isActive ? w.tierColor : "var(--text-body-subtle)" }}>
            {isActive ? "Actif" : w.status === "past" ? "Passé" : "À venir"}
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
          {delLoading && <span className="ml-2 text-[10px] font-normal text-text-body-subtle">délinéation…</span>}
        </h3>
        <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

        {/* Shared theme */}
        <div className="mt-3 rounded-xl px-3.5 py-2.5"
          style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}>
          {delLoading ? (
            <div className="h-3 rounded animate-pulse w-3/4"
              style={{ background: `color-mix(in srgb, ${w.tierColor} 20%, transparent)` }} />
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

        {/* People */}
        <div className="mt-3 space-y-2">
          <div className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
            <div className="flex items-start justify-between gap-2">
              <EyebrowLabel color="var(--accent-purple)" className="mb-1">
                24-10-1980 Brussels
              </EyebrowLabel>
              {del && (
                <span className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
                  style={{ color: "var(--accent-purple)", opacity: 0.5 }}>
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
              <EyebrowLabel color={REL_COLOR} className="mb-1">
                02-09-1982 Antwerp
              </EyebrowLabel>
              {del && (
                <span className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
                  style={{ color: REL_COLOR, opacity: 0.5 }}>
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

        {/* Action */}
        <div className="mt-2 rounded-xl px-3.5 py-2.5"
          style={{
            background: `color-mix(in srgb, ${w.tierColor} 10%, transparent)`,
            border: `1px solid color-mix(in srgb, ${w.tierColor} 15%, transparent)`,
          }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: w.tierColor }}>
            À faire ensemble
          </p>
          {delLoading ? (
            <div className="space-y-1">
              <div className="h-2.5 rounded animate-pulse w-full"
                style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
              <div className="h-2.5 rounded animate-pulse w-3/5"
                style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
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

// ─── Page ────────────────────────────────────────────────

export default function ConnectionBriefTestPage() {
  const [windows, setWindows] = useState<MatchingWindow[]>([]);
  const [periods, setPeriods] = useState<ActivePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<number | null>(null);

  useEffect(() => {
    const t0 = Date.now();
    fetchConnectionBrief(PERSON_A, PERSON_B, "partner", "Partenaire", 3)
      .then((result) => {
        setWindows(result.windows);
        setPeriods(result.periods);
        setElapsed(Date.now() - t0);
      })
      .catch((err) => setError(String(err)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex min-h-0 flex-col">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/demo/compatibility"
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "var(--surface-medium)" }}>
          <ArrowLeft size={16} style={{ color: "var(--text-body-subtle)" }} />
        </Link>
        <div>
          <h1 className="font-display text-lg font-bold text-text-heading">
            Test connection-brief
          </h1>
          <p className="text-[11px] text-text-body-subtle">
            24-10-1980 Brussels · 02-09-1982 Antwerp · partner
          </p>
        </div>
      </div>

      {/* API badge */}
      <div className="mb-4 rounded-xl px-3 py-2 text-[10px] font-mono"
        style={{ background: "var(--surface-subtle)", color: "var(--text-body-subtle)" }}>
        connection-brief → OpenAI delineation
        {elapsed !== null && (
          <span className="ml-2" style={{ color: "var(--accent-purple)" }}>
            {(elapsed / 1000).toFixed(1)}s
          </span>
        )}
      </div>

      {loading && (
        <div className="flex flex-1 items-center justify-center gap-3 py-12">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-transparent"
            style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-sm text-text-body-subtle">Appel à l&apos;API…</span>
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "color-mix(in srgb, #D89EA0 15%, transparent)", color: "#D89EA0" }}>
          {error}
        </div>
      )}

      {!loading && windows.length > 0 && (
        <div className="space-y-4">
          <p className="text-[11px] text-text-body-subtle">
            {windows.length} période{windows.length !== 1 ? "s" : ""} · délinéation en cours…
          </p>
          {windows.map((w, i) => (
            <WindowCard key={w.monthKey} w={w} period={periods[i]} i={i} />
          ))}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
