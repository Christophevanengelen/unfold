"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TimeControl, type TimeView } from "./TimeControl";
import { PageDots } from "./PageDots";
import { OverallPage } from "./OverallPage";
import { DomainPage } from "./DomainPage";
import { usePremiumTeaser } from "./PremiumTeaserContext";

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
const GAP = 12;
/** How many px of adjacent cards are visible on each side */
const PEEK = 44;
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

  // Close detail sheet when time view changes
  useEffect(() => {
    setDetailDomain(null);
  }, [timeView]);

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

  /** Detect which card is centered on scroll */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || wrapperWidth === 0) return;

    const scrollLeft = el.scrollLeft;
    const viewportCenter = scrollLeft + wrapperWidth / 2;

    let closestIndex = 0;
    let closestDist = Infinity;

    for (let i = 0; i < TOTAL_PAGES; i++) {
      const cardCenter = sidePadding + i * (cardWidth + GAP) + cardWidth / 2;
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
      />
    )),
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Time control — top (z-30 above scroll container bleed) */}
      <div className="relative shrink-0 px-5 pt-1 pb-2" style={{ zIndex: 30 }}>
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
            const dist = Math.abs(i - activePage);
            const isCurrent = dist === 0;
            return (
              <div
                key={i}
                className="relative shrink-0 overflow-hidden rounded-3xl"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth,
                  scrollSnapAlign: "center",
                  background: "color-mix(in srgb, var(--card-bg) 70%, transparent)",
                  backdropFilter: "blur(16px)",
                  WebkitBackdropFilter: "blur(16px)",
                  border: "1px solid var(--card-border)",
                  boxShadow: isCurrent
                    ? "var(--card-shadow)"
                    : "0 2px 8px rgba(0,0,0,0.06)",
                  transform: isCurrent ? "scale(1)" : "scale(0.98)",
                  opacity: isCurrent ? 1 : 0.7,
                  zIndex: isCurrent ? 2 : 1,
                  transition:
                    "transform 0.35s ease, box-shadow 0.35s ease, opacity 0.35s ease",
                }}
              >
                {page}
              </div>
            );
          })}
        </div>
      </div>

      {/* Page dots — bottom (z-30 above scroll container bleed) */}
      <div className="relative shrink-0" style={{ zIndex: 30 }}>
        <PageDots
          total={TOTAL_PAGES}
          active={activePage}
          onDotTap={scrollToPage}
        />
      </div>

      {/* Domain detail sheet */}
      {detailDomain && (
        <DomainDetailSheet
          open={!!detailDomain}
          onClose={() => setDetailDomain(null)}
          domain={detailDomain}
          detail={mockDomainDetails[timeView][detailDomain]}
          score={data.scores[detailDomain].value}
          trend={data.scores[detailDomain].trend}
          color={domainConfig[detailDomain].color}
          onPremiumTap={() => {
            setDetailDomain(null);
            openPremium();
          }}
        />
      )}
    </div>
  );
}
