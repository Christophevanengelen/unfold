"use client";

/**
 * LifeTimeline — The core product view.
 *
 * Displays the user's lifetime events as sausages on a horizontal
 * scrollable timeline. Events are grouped by year, with visual
 * distinction between the 4 event categories.
 *
 * The timeline auto-scrolls to "now" on mount.
 */

import { useRef, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AnyTocTocEvent } from "@/types/api";
import { SausageCard } from "./SausageCard";
import { EventDetailSheet } from "./EventDetailSheet";
import { DecadeBar } from "./DecadeBar";
import type { DecadeTimeline } from "@/types/api";

interface LifeTimelineProps {
  events: AnyTocTocEvent[];
  decades?: DecadeTimeline;
  /** Person's birth year for decade bar */
  birthYear?: number;
}

export function LifeTimeline({ events, decades, birthYear = 1980 }: LifeTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nowRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<AnyTocTocEvent | null>(null);

  // Group events by year
  const eventsByYear = useMemo(() => {
    const groups = new Map<number, AnyTocTocEvent[]>();
    events.forEach(e => {
      const year = new Date(e.date).getFullYear();
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year)!.push(e);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a - b);
  }, [events]);

  // Find current year
  const currentYear = new Date().getFullYear();

  // Auto-scroll to "now" marker on mount
  useEffect(() => {
    const timeout = setTimeout(() => {
      nowRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }, 300);
    return () => clearTimeout(timeout);
  }, []);

  // Determine if an event overlaps with "now"
  const isCurrentEvent = (e: AnyTocTocEvent): boolean => {
    const now = new Date();
    return new Date(e.date) <= now && new Date(e.endDate) >= now;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Decade bar (delight #3) */}
      {decades && (
        <div className="px-4 pt-2 pb-3">
          <DecadeBar decades={decades} birthYear={birthYear} currentAge={currentYear - birthYear} />
        </div>
      )}

      {/* Timeline scroll area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-none"
        style={{ scrollBehavior: "smooth" }}
      >
        <div className="flex h-full items-stretch gap-0 px-4" style={{ minWidth: "max-content" }}>
          {eventsByYear.map(([year, yearEvents]) => {
            const isNow = year === currentYear;
            const isPast = year < currentYear;

            return (
              <div key={year} className="flex flex-col" ref={isNow ? nowRef : undefined}>
                {/* Year label */}
                <div className="flex items-center gap-2 px-3 pb-2">
                  <span className={`text-xs font-bold tracking-wide ${
                    isNow ? "text-accent-purple" : isPast ? "text-text-body-subtle/50" : "text-text-body-subtle"
                  }`}>
                    {year}
                  </span>
                  {isNow && (
                    <div className="h-px flex-1 bg-accent-purple/30" />
                  )}
                </div>

                {/* Events column */}
                <div className="flex flex-col gap-2 px-2" style={{ minWidth: 160 }}>
                  {yearEvents.map((event, i) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      <SausageCard
                        event={event}
                        compact
                        onTap={setSelectedEvent}
                        isHighlighted={isCurrentEvent(event)}
                      />
                    </motion.div>
                  ))}
                </div>

                {/* Now marker */}
                {isNow && (
                  <div className="mt-auto flex items-center gap-1 px-3 pt-2 pb-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-accent-purple animate-pulse" />
                    <span className="text-[9px] font-semibold uppercase tracking-widest text-accent-purple">
                      maintenant
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event detail sheet */}
      <AnimatePresence>
        {selectedEvent && (
          <EventDetailSheet
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
