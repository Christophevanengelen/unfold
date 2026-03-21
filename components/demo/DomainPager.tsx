// @ts-nocheck
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TimeControl, type TimeView } from "./TimeControl";
import { OverallPage } from "./OverallPage";
import { DomainPage } from "./DomainPage";
import { usePremiumTeaser } from "./PremiumTeaserContext";
import { PageDots } from "./PageDots";
import { DomainDetailSheet } from "./DomainDetailSheet";
import { DOMAINS, domainConfig, type DomainKey } from "@/lib/domain-config";
import {
  mockYesterday,
  mockToday,
  mockTomorrow,
  mockDeltas,
  mockTrend,
  mockStructuredInsights,
  mockDomainDetails,
} from "@/lib/mock-data";

/** Carousel configuration */
const TOTAL_PAGES = 4;
const GAP = 4;
/** How many px of adjacent cards are visible on each side */
const PEEK = 40;
/** Extra space above/below scroll container so card shadows aren't clipped */
const SHADOW_BLEED = 40;

/** Map time view to data */
const dataMap = {
  yesterday: mockYesterday,
  today: mockToday,
  tomorrow: mockTomorrow,
};

/** Compute deltas for each time view */
function getDeltas(view: TimeView) {
  if (view === "today") return mockDeltas;
  if (view === "yesterday") {
    return { love: -3, health: 2, work: -4, overall: -1 };
  }
  return {
    love: mockTomorrow.scores.love.value - mockToday.scores.love.value,
    health: mockTomorrow.scores.health.value - mockToday.scores.health.value,
    work: mockTomorrow.scores.work.value - mockToday.scores.work.value,
    overall: mockTomorrow.overall - mockToday.overall,
  };
}

/**
 * Scroll-snap card carousel — native horizontal scrolling.
 *
 * Each card snaps to center. Adjacent cards peek from left/right.
 * Uses CSS scroll-snap-type: x mandatory for buttery smooth native feel.
 */
export function DomainPager() {
  const openPremium = usePremiumTeaser();
  const [activePage, setActivePage] = useState(0);
  const [timeView, setTimeView] = useState<TimeView>("today");
  const [detailDomain, setDetailDomain] = useState<DomainKey | null>(null);
  const lastDomainRef = useRef<DomainKey>("love");

  // Track last opened domain so we can still render during exit animation
  if (detailDomain) lastDomainRef.current = detailDomain;
  const lastDomain = lastDomainRef.current;

  // Measure the WRAPPER (not the scroll container) to avoid circular dependency
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [wrapperWidth, setWrapperWidth] = useState(0);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWrapperWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Card width = wrapper width - peek on each side
  const cardWidth = wrapperWidth > 0 ? wrapperWidth - PEEK * 2 : 300;
  // Side padding so first/last card can center
  const sidePadding = PEEK;

  // Derive data from current time view
  const data = dataMap[timeView];
  const deltas = getDeltas(timeView);

  // Sparkline trend data
  const trend7D = {
    love: mockTrend.dataPoints.map((d) => d.love),
    health: mockTrend.dataPoints.map((d) => d.health),
    work: mockTrend.dataPoints.map((d) => d.work),
    overall: mockTrend.dataPoints.map((d) => d.overall),
  };
  const trendData = trend7D;

  // Continuous scroll progress — fractional page index (e.g. 0.5 = halfway between page 0 and 1)
  const [scrollProgress, setScrollProgress] = useState(0);

  /** Detect which card is centered on scroll + track continuous progress */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || wrapperWidth === 0) return;

    const scrollLeft = el.scrollLeft;
    const viewportCenter = scrollLeft + wrapperWidth / 2;

    // Continuous fractional page index
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

    if (closestIndex !== activePage) {
      setActivePage(closestIndex);
    }
  }, [wrapperWidth, cardWidth, sidePadding, activePage]);

  /** Programmatic scroll to a page */
  const scrollToPage = useCallback(
    (page: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(TOTAL_PAGES - 1, page));
      el.scrollTo({
        left: clamped * (cardWidth + GAP),
        behavior: "smooth",
      });
    },
    [cardWidth],
  );

  /** Handle domain detail tap — open domain detail sheet */
  const handleDetailTap = useCallback((domain: DomainKey) => {
    setDetailDomain(domain);
  }, []);

  // Map timeView to 7-day week index (yesterday=2, today=3, tomorrow=4)
  const activeDayIndex = timeView === "yesterday" ? 2 : timeView === "today" ? 3 : 4;

  // Page content array
  const pages = [
    <OverallPage
      key="overall"
      isActive={activePage === 0}
      data={data}
      deltas={deltas}
      label={data.label ?? ""}
      structuredInsight={mockStructuredInsights[timeView].overall}
      trendData={trendData.overall}
      cardWidth={cardWidth}
      activeDayIndex={activeDayIndex}
    />,
    ...DOMAINS.map((domain, i) => (
      <DomainPage
        key={domain}
        domain={domain}
        isActive={activePage === i + 1}
        score={data.scores[domain].value}
        trend={data.scores[domain].trend}
        delta={deltas[domain]}
        peakHour={data.scores[domain].peakHour ?? 12}
        description={data.scores[domain].description}
        structuredInsight={mockStructuredInsights[timeView][domain]}
        trendData={trendData[domain]}
        cardWidth={cardWidth}
        onDetailTap={() => handleDetailTap(domain)}
        activeDayIndex={activeDayIndex}
      />
    )),
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Time control — top (z-30 above scroll container bleed) */}
      <div className="relative shrink-0 px-5 pt-1 pb-2" style={{ zIndex: 45 }}>
        <TimeControl value={timeView} onChange={setTimeView} />
      </div>

      {/* Carousel wrapper — z-20 so shadow bleeds over TimeControl & BottomNav */}
      <div ref={wrapperRef} className="relative flex-1" style={{ zIndex: 20 }}>
        {/* Scroll-snap container — extends beyond wrapper so card shadows aren't clipped */}
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
          {pages.map((page, i) => {
            // Continuous distance from center (0 = centered, 1 = one page away)
            const dist = Math.abs(i - scrollProgress);
            const t = Math.min(dist, 1.5); // clamp

            // Fluid interpolation — scale, translateY for depth (no opacity fade)
            const scale = 1 - t * 0.08; // 1.0 → 0.92
            const translateY = t * 8; // 0 → 8px (sink down)
            const shadowBlur = Math.max(0, 40 - t * 32); // 40 → 8
            const shadowAlpha = Math.max(0.06, 0.5 - t * 0.44);

            return (
              <div
                key={i}
                className="relative shrink-0 overflow-hidden rounded-3xl"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth,
                  scrollSnapAlign: "center",
                  background: "var(--card-bg)",
                  border: "none",
                  boxShadow: `0 8px ${shadowBlur}px rgba(20, 15, 45, ${shadowAlpha})`,
                  transform: `scale(${scale}) translateY(${translateY}px)`,
                  zIndex: dist < 0.5 ? 2 : 1,
                  willChange: "transform, opacity",
                }}
              >
                {page}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card page dots */}
      <div className="relative shrink-0" style={{ zIndex: 30 }}>
        <PageDots total={TOTAL_PAGES} active={activePage} onDotTap={scrollToPage} />
      </div>

      {/* Domain detail sheet — always mounted so AnimatePresence can play exit */}
      <DomainDetailSheet
        open={!!detailDomain}
        onClose={() => setDetailDomain(null)}
        domain={detailDomain ?? lastDomain}
        detail={mockDomainDetails[timeView][detailDomain ?? lastDomain]}
        score={data.scores[detailDomain ?? lastDomain].value}
        delta={deltas[detailDomain ?? lastDomain]}
        trend={data.scores[detailDomain ?? lastDomain].trend}
        color={domainConfig[detailDomain ?? lastDomain].color}
        caution={mockStructuredInsights[timeView][detailDomain ?? lastDomain]?.caution}
        onPremiumTap={() => {
          setDetailDomain(null);
          openPremium();
        }}
        onSwipeDay={(dir) => {
          const order: TimeView[] = ["yesterday", "today", "tomorrow"];
          const idx = order.indexOf(timeView);
          const next = dir === "next" ? idx + 1 : idx - 1;
          if (next >= 0 && next < order.length) setTimeView(order[next]);
        }}
      />
    </div>
  );
}
