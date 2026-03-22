"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { AnimatePresence } from "motion/react";
import { motion } from "motion/react";
import { PageDots } from "./PageDots";
import { CapsuleCard } from "./CapsuleCard";
import { getHomeCapsules, type CapsuleData } from "@/lib/capsules";
import { planetConfig } from "@/lib/domain-config";
import { useMomentum } from "@/lib/momentum-store";

/** Carousel configuration */
const TOTAL_PAGES = 3;
const GAP = 4;
const PEEK = 40;
const SHADOW_BLEED = 40;

/**
 * SignalPager — 3-page carousel: Past / Present / Future capsule.
 *
 * Each card shows the capsule's planets (keywords), intensity, tier,
 * and narrative. Same data as the timeline, different presentation.
 */
export function SignalPager() {
  const [activePage, setActivePage] = useState(1); // Start on Present
  const { phases } = useMomentum();
  const { past, current, future } = useMemo(() => getHomeCapsules(phases), [phases]);

  // Detail sheet state
  const [selectedCapsule, setSelectedCapsule] = useState<CapsuleData | null>(null);

  // Measure wrapper
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setWrapperWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Auto-scroll to Present (page 1) on mount
  const didAutoScroll = useRef(false);
  useEffect(() => {
    if (wrapperWidth > 0 && scrollRef.current && !didAutoScroll.current) {
      didAutoScroll.current = true;
      const cardWidth = wrapperWidth - PEEK * 2;
      scrollRef.current.scrollTo({ left: 1 * (cardWidth + GAP), behavior: "instant" as ScrollBehavior });
    }
  }, [wrapperWidth]);

  const cardWidth = wrapperWidth > 0 ? wrapperWidth - PEEK * 2 : 300;
  const sidePadding = PEEK;

  const [scrollProgress, setScrollProgress] = useState(1);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || wrapperWidth === 0) return;

    const scrollLeft = el.scrollLeft;
    const viewportCenter = scrollLeft + wrapperWidth / 2;
    const pageUnit = cardWidth + GAP;
    const fractionalPage = pageUnit > 0
      ? (viewportCenter - sidePadding - cardWidth / 2) / pageUnit
      : 0;
    setScrollProgress(fractionalPage);

    let closestIndex = 0;
    let closestDist = Infinity;
    for (let i = 0; i < TOTAL_PAGES; i++) {
      const cardCenter = sidePadding + i * pageUnit + cardWidth / 2;
      const dist = Math.abs(viewportCenter - cardCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    }
    if (closestIndex !== activePage) setActivePage(closestIndex);
  }, [wrapperWidth, cardWidth, sidePadding, activePage]);

  const scrollToPage = useCallback(
    (page: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(TOTAL_PAGES - 1, page));
      el.scrollTo({ left: clamped * (cardWidth + GAP), behavior: "smooth" });
    },
    [cardWidth],
  );

  // Build card data
  const cards: { capsule: CapsuleData; mode: "past" | "present" | "future" }[] = [];
  if (past) cards.push({ capsule: past, mode: "past" });
  else if (current) cards.push({ capsule: current, mode: "past" }); // fallback
  if (current) cards.push({ capsule: current, mode: "present" });
  if (future) cards.push({ capsule: future, mode: "future" });

  // Pad to 3 if missing
  while (cards.length < 3) {
    cards.push({ capsule: cards[cards.length - 1]?.capsule ?? current!, mode: "future" });
  }

  const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return (
    <div className="flex h-full flex-col">
      {/* Carousel wrapper */}
      <div ref={wrapperRef} className="relative flex-1" style={{ zIndex: 20 }}>
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="no-scrollbar absolute flex items-stretch"
          style={{
            left: 0,
            right: 0,
            top: -SHADOW_BLEED,
            bottom: -SHADOW_BLEED,
            paddingTop: SHADOW_BLEED,
            paddingBottom: SHADOW_BLEED,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
            paddingLeft: sidePadding,
            paddingRight: sidePadding,
            gap: GAP,
          }}
        >
          {cards.map(({ capsule, mode }, i) => {
            const dist = Math.abs(i - scrollProgress);
            const t = Math.min(dist, 1.5);
            const scale = 1 - t * 0.08;
            const translateY = t * 8;
            const shadowBlur = Math.max(0, 40 - t * 32);
            const shadowAlpha = Math.max(0.06, 0.5 - t * 0.44);

            return (
              <div
                key={`${mode}-${capsule.id}`}
                className="relative shrink-0 overflow-hidden rounded-3xl"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth,
                  scrollSnapAlign: "center",
                  background: "var(--card-bg)",
                  boxShadow: `0 8px ${shadowBlur}px rgba(20, 15, 45, ${shadowAlpha})`,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  zIndex: dist < 0.5 ? 2 : 1,
                  willChange: "transform",
                }}
              >
                <CapsuleCard
                  capsule={capsule}
                  mode={mode}
                  isActive={i === activePage}
                  onExplore={mode !== "future" ? () => setSelectedCapsule(capsule) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Next peak highlight — Delight #2 */}
      {future && activePage === 1 && (
        <motion.div
          className="mx-5 mb-2 flex items-center gap-3 rounded-xl px-3.5 py-2.5"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)",
            border: "1px solid color-mix(in srgb, var(--accent-purple) 10%, transparent)",
            zIndex: 25,
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
          >
            <div className="flex flex-col items-center gap-[2px]">
              {(future.planets ?? []).slice(0, 2).map((p, i) => (
                <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: planetConfig[p]?.color ?? "#9585CC" }} />
              ))}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-text-body-subtle">Next peak</p>
            <p className="text-xs font-medium text-text-heading truncate">
              {future.phases[0]?.title ?? "Coming soon"}
            </p>
          </div>
          <span className="text-[10px] text-text-body-subtle shrink-0">
            {future.phases[0]?.startDate
              ? MONTH_NAMES[new Date(future.phases[0].startDate + "T00:00:00").getMonth()]
              : ""}
          </span>
        </motion.div>
      )}

      {/* Page dots */}
      <div className="relative shrink-0" style={{ zIndex: 30 }}>
        <PageDots total={TOTAL_PAGES} active={activePage} onDotTap={scrollToPage} />
      </div>

      {/* Detail sheet — same as timeline */}
      <AnimatePresence>
        {selectedCapsule && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40"
              style={{ background: "rgba(0,0,0,0.4)" }}
              onClick={() => setSelectedCapsule(null)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 35 }}
              className="absolute inset-x-0 bottom-0 z-50 overflow-hidden"
              style={{
                borderRadius: "1.5rem 1.5rem 0 0",
                background: "var(--bg-secondary)",
                borderTop: "1px solid var(--border-muted)",
                maxHeight: "65%",
              }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-base)" }} />
              </div>
              <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: "calc(65vh - 20px)" }}>
                {/* Header */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--text-heading)" }}>
                    {selectedCapsule.tierOccurrence}
                  </span>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--accent-purple)" }}>
                      {selectedCapsule.tier === "toctoctoc" ? "PEAK" : selectedCapsule.tier === "toctoc" ? "CLEAR" : "SUBTLE"}
                    </span>
                    <p className="text-[10px] tabular-nums" style={{ color: "var(--text-body-subtle)" }}>
                      {MONTH_NAMES[selectedCapsule.startDate.getMonth()]} {selectedCapsule.startDate.getFullYear()} — {selectedCapsule.isCurrent ? "Now" : `${MONTH_NAMES[selectedCapsule.endDate.getMonth()]} ${selectedCapsule.endDate.getFullYear()}`}
                    </p>
                  </div>
                </div>

                {/* Planet pills */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedCapsule.planets.map((planet) => {
                    const pc = planetConfig[planet];
                    return (
                      <div
                        key={planet}
                        className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                        style={{
                          background: `color-mix(in srgb, ${pc.color} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${pc.color} 25%, transparent)`,
                        }}
                      >
                        <div className="h-2 w-2 rounded-full" style={{ background: pc.color, boxShadow: `0 0 6px ${pc.color}` }} />
                        <span className="text-[11px] font-medium" style={{ color: pc.color }}>{pc.label}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Content */}
                {selectedCapsule.phases[0] && (
                  <>
                    <h3 className="mt-5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
                      {selectedCapsule.phases[0].title}
                    </h3>
                    <p className="mt-1 text-xs" style={{ color: "var(--text-body-subtle)" }}>
                      {selectedCapsule.phases[0].subtitle}
                    </p>
                    <p className="mt-4 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
                      {selectedCapsule.phases[0].description}
                    </p>
                    {selectedCapsule.phases[0].keyInsight && (
                      <div className="mt-4 rounded-xl px-3.5 py-3" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>Key Insight</p>
                        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>{selectedCapsule.phases[0].keyInsight}</p>
                      </div>
                    )}
                    {selectedCapsule.phases[0].guidance && (
                      <div className="mt-3 rounded-xl px-3.5 py-3" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--accent-purple)" }}>Guidance</p>
                        <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>{selectedCapsule.phases[0].guidance}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
