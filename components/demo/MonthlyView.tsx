"use client";

/**
 * MonthlyView — "Ce mois-ci" dashboard.
 *
 * Uses toctoc-year data (fast: 2-10s) to show:
 * 1. Current month summary with score
 * 2. Active events this month
 * 3. Peak upcoming months (Delight #2: "Ton prochain pic")
 * 4. Year summary bars
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { TocTocYearData, MonthEntry, MonthlyEvent } from "@/types/api";
import { tocScoreConfig, categoryConfig, zrLotLabels, formatDateRange } from "@/lib/domain-config";
import { EventDetailSheet } from "./EventDetailSheet";
import type { AnyTocTocEvent } from "@/types/api";
import { mockEvents } from "@/lib/mock-data";

interface MonthlyViewProps {
  data: TocTocYearData;
}

export function MonthlyView({ data }: MonthlyViewProps) {
  const { currentMonth, peakUpcomingMonths, years, months } = data;

  return (
    <div className="flex h-full flex-col overflow-y-auto scrollbar-none px-4 py-3 gap-5">
      {/* Current month hero */}
      <CurrentMonthCard month={currentMonth} />

      {/* Peak upcoming months — Delight #2 */}
      {peakUpcomingMonths.length > 0 && (
        <section>
          <h3 className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
            Tes prochains pics
          </h3>
          <div className="flex flex-col gap-2">
            {peakUpcomingMonths.map(m => (
              <PeakMonthCard key={m.month} month={m} />
            ))}
          </div>
        </section>
      )}

      {/* Year summary bars */}
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
          Vue annuelle
        </h3>
        <div className="flex gap-2">
          {years.map(y => (
            <YearBar key={y.year} year={y} maxScore={Math.max(...years.map(yr => yr.sumScore), 1)} />
          ))}
        </div>
      </section>

      {/* Monthly grid (scrollable) */}
      <section>
        <h3 className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
          Mois par mois
        </h3>
        <div className="grid grid-cols-3 gap-1.5">
          {months.filter(m => !m.isPast || m.isCurrentMonth).slice(0, 12).map(m => (
            <MonthCell key={m.month} month={m} isCurrent={m.isCurrentMonth ?? false} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Current Month Card ─────────────────────────────────

function CurrentMonthCard({ month }: { month: MonthEntry }) {
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  const [y, m] = month.month.split("-").map(Number);
  const monthName = monthNames[m - 1];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-bold text-text-heading">{monthName} {y}</h2>
          <p className="text-[10px] text-text-body-subtle">Ce mois-ci</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-accent-purple">
            {month.topEvents.filter(e => e.score >= 3).length}
          </span>
          <p className="text-[10px] text-text-body-subtle">événements majeurs</p>
        </div>
      </div>

      {/* Active events this month */}
      {month.topEvents.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {month.topEvents.slice(0, 4).map((ev, i) => (
            <MonthlyEventRow key={i} event={ev} />
          ))}
        </div>
      )}

      {month.topEvents.length === 0 && (
        <p className="text-xs text-text-body-subtle italic">Mois calme — pas d'événement majeur</p>
      )}
    </div>
  );
}

// ─── Peak Month Card (Delight #2) ───────────────────────

function PeakMonthCard({ month }: { month: MonthEntry }) {
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const [y, m] = month.month.split("-").map(Number);

  const topEvent = month.topEvents.sort((a, b) => b.score - a.score)[0];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-purple/20 text-accent-purple">
        <span className="text-sm font-bold">{monthNames[m - 1]}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-text-heading">
          {monthNames[m - 1]} {y}
        </p>
        {topEvent && (
          <p className="text-[10px] text-text-body-subtle truncate">
            {topEvent.type}
          </p>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {topEvent && Array.from({ length: topEvent.score }).map((_, i) => (
          <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: topEvent.color }} />
        ))}
      </div>
    </div>
  );
}

// ─── Year Bar ───────────────────────────────────────────

function YearBar({ year, maxScore }: { year: { year: number; sumScore: number; isBusy: boolean; peakMonth: string }; maxScore: number }) {
  const height = Math.max((Math.abs(year.sumScore) / maxScore) * 80, 8);
  const isNow = year.year === new Date().getFullYear();

  return (
    <div className="flex flex-1 flex-col items-center gap-1">
      <div className="flex items-end" style={{ height: 90 }}>
        <div
          className={`w-full rounded-t-sm ${
            isNow ? "bg-accent-purple" : year.isBusy ? "bg-amber-500/50" : "bg-white/15"
          }`}
          style={{ height, minWidth: 24 }}
        />
      </div>
      <span className={`text-[10px] ${isNow ? "text-accent-purple font-bold" : "text-text-body-subtle"}`}>
        {year.year}
      </span>
      {year.isBusy && (
        <span className="text-[8px] text-amber-400">intense</span>
      )}
    </div>
  );
}

// ─── Month Cell ─────────────────────────────────────────

function MonthCell({ month, isCurrent }: { month: MonthEntry; isCurrent: boolean }) {
  const [, m] = month.month.split("-").map(Number);
  const labels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const eventCount = month.topEvents.length;
  const maxScore = month.topEvents.reduce((max, e) => Math.max(max, e.score), 0);

  return (
    <div className={`flex flex-col items-center rounded-lg p-2 ${
      isCurrent ? "border border-accent-purple/30 bg-accent-purple/10" : "border border-white/5 bg-white/[0.02]"
    }`}>
      <span className={`text-[10px] font-medium ${isCurrent ? "text-accent-purple" : "text-text-body-subtle"}`}>
        {labels[m - 1]}
      </span>
      {eventCount > 0 ? (
        <div className="flex items-center gap-0.5 mt-1">
          {Array.from({ length: Math.min(maxScore, 4) }).map((_, i) => (
            <div key={i} className="h-1 w-1 rounded-full bg-white/40" />
          ))}
        </div>
      ) : (
        <div className="h-2.5" />
      )}
    </div>
  );
}

// ─── Monthly Event Row ──────────────────────────────────

function MonthlyEventRow({ event }: { event: MonthlyEvent }) {
  const catMeta = categoryConfig[event.category];

  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-white/[0.03] px-2.5 py-1.5">
      <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-medium text-text-body truncate">{event.type}</p>
      </div>
      <div className="flex items-center gap-0.5 flex-shrink-0">
        {Array.from({ length: event.score }).map((_, i) => (
          <div key={i} className="h-1 w-1 rounded-full" style={{ backgroundColor: event.color }} />
        ))}
      </div>
    </div>
  );
}
