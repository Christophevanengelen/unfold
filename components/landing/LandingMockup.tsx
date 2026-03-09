"use client";

import { useEffect, useRef, useState } from "react";
import { LayoutGroup } from "motion/react";

// Real demo components (never modify these files)
import { OverallPage } from "@/components/demo/OverallPage";
import { DomainPage } from "@/components/demo/DomainPage";
import { DomainDetailSheet } from "@/components/demo/DomainDetailSheet";
import { TimeControl, type TimeView } from "@/components/demo/TimeControl";
import { PageDots } from "@/components/demo/PageDots";
import { PremiumTeaserContext } from "@/components/demo/PremiumTeaserContext";
// Custom landing logo (icon mark only, from logo_unfold_landing.svg)
function LandingLogoMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 173 173"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M166.563 129.678C166.563 129.678 166.542 129.664 166.532 129.657L135.172 107.217L91.0805 151.894L91.0385 151.936C91.0385 151.936 91.0209 151.954 91.0104 151.964L90.9929 151.982C90.9929 151.982 90.9824 151.989 90.9789 151.996C88.4508 154.45 84.4081 154.419 81.9187 151.898L80.9124 150.877L37.8274 107.221L6.46734 129.657C6.46734 129.657 6.4463 129.675 6.43578 129.678C3.3713 131.831 -0.59779 128.57 0.937954 125.138L35.5308 47.8316C36.0217 46.7377 36.8456 45.9102 37.8274 45.4088C39.2965 44.6515 41.1127 44.6269 42.666 45.528C42.673 45.5315 42.6765 45.535 42.6836 45.5385L52.4801 51.2713L82.7216 17.1168C84.7272 14.8517 88.265 14.8517 90.2741 17.1168L120.516 51.2643L130.312 45.535L130.323 45.528C131.876 44.6234 133.696 44.6479 135.165 45.4018C136.133 45.8997 136.95 46.7096 137.44 47.7861C137.44 47.7861 137.444 47.7896 137.444 47.7931C137.447 47.8036 137.454 47.8141 137.458 47.8246C137.458 47.8246 137.458 47.8281 137.458 47.8316L172.051 125.138C173.586 128.57 169.617 131.835 166.553 129.678H166.563Z" fill="#C1A7FF"/>
      <path d="M37.8274 45.4031V107.212L6.46734 129.655C6.46734 129.655 6.4463 129.673 6.43578 129.676C3.3713 131.829 -0.59779 128.568 0.937954 125.136L35.5308 47.8294C36.0217 46.7355 36.8456 45.908 37.8274 45.4066V45.4031Z" fill="white"/>
      <path d="M166.567 129.676C166.567 129.676 166.546 129.662 166.536 129.655L135.176 107.215V45.4031C136.144 45.901 136.96 46.7109 137.451 47.7873C137.451 47.7873 137.455 47.7908 137.455 47.7943C137.458 47.8049 137.465 47.8154 137.469 47.8259C137.469 47.8259 137.469 47.8294 137.469 47.8329L172.062 125.139C173.597 128.572 169.628 131.836 166.564 129.68L166.567 129.676Z" fill="white"/>
      <path d="M68.0795 60.3969L37.8169 107.209V45.4041C39.286 44.6468 41.1023 44.6222 42.6555 45.5233C42.6626 45.5269 42.6661 45.5304 42.6731 45.5339L52.4696 51.2631L68.0795 60.3969Z" fill="#DACAFF"/>
      <path d="M135.166 45.4042V107.213L104.9 60.397L120.513 51.2632L130.31 45.5339L130.32 45.5269C131.874 44.6223 133.693 44.6469 135.162 45.4007L135.166 45.4042Z" fill="#DACAFF"/>
      <path d="M135.154 107.212L91.0666 151.889L91.0245 151.931C91.0245 151.931 91.0069 151.948 90.9964 151.959L90.9789 151.976C90.9789 151.976 90.9684 151.983 90.9649 151.99C88.4369 154.445 84.3941 154.413 81.9047 151.892L80.8984 150.872L37.8169 107.215L68.0795 60.3996L82.1536 38.6292C84.1838 35.4875 88.7805 35.4875 90.8141 38.6292L135.154 107.215V107.212Z" fill="white"/>
    </svg>
  );
}

// Data (same sources as the real demo)
import {
  mockYesterday,
  mockToday,
  mockTomorrow,
  mockDeltas,
  mockTrend,
  mockStructuredInsights,
  mockDomainDetails,
} from "@/lib/mock-data";
import { domainConfig } from "@/lib/domain-config";


// ─── Data mapping (same as DomainPager.tsx) ─────────────────────
const dataMap = {
  yesterday: mockYesterday,
  today: mockToday,
  tomorrow: mockTomorrow,
};

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

const trend7D = {
  love: mockTrend.dataPoints.map((d) => d.love),
  health: mockTrend.dataPoints.map((d) => d.health),
  work: mockTrend.dataPoints.map((d) => d.work),
  overall: mockTrend.dataPoints.map((d) => d.overall),
};

// Per-view trend data: different slices so TrendCurve's dataKey changes
// on each time switch, triggering the draw animation.
// Yesterday = trend ending at yesterday, Today = full week, Tomorrow = shifted window.
const overallTrendForView: Record<TimeView, number[]> = {
  yesterday: trend7D.overall.slice(0, -1),
  today: trend7D.overall,
  tomorrow: [...trend7D.overall.slice(1), mockTomorrow.overall],
};

// ─── Time view cycle order ──────────────────────────────────────
const TIME_VIEWS: TimeView[] = ["yesterday", "today", "tomorrow"];
const CYCLE_INTERVAL = 3500; // ms per view

// ─── Shared: IntersectionObserver hook ──────────────────────────
function useInView(threshold = 0.3) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// ─── Decorative StatusBar (matches demo layout) ─────────────────
function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 pb-2">
      <span className="text-xs font-medium text-text-body-subtle">9:41</span>
      <LandingLogoMark size={22} />
      <div
        className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-brand-soft text-[10px] font-bold text-accent-purple"
        aria-hidden="true"
      >
        A
      </div>
    </div>
  );
}

// ─── Decorative BottomNav ────────────────────────────────────────
function BottomNav() {
  return (
    <div
      className="flex items-center justify-center gap-8 pb-2 pt-1"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="flex flex-col items-center gap-0.5">
        <div
          className="h-[3px] w-[3px] rounded-full"
          style={{ background: "var(--accent-purple)" }}
        />
        <span
          style={{
            fontSize: 8,
            color: "var(--accent-purple)",
            fontWeight: 500,
          }}
        >
          Momentum
        </span>
      </div>
      <div className="flex flex-col items-center gap-0.5">
        <div
          className="h-[3px] w-[3px] rounded-full"
          style={{ background: "var(--text-body-subtle)" }}
        />
        <span
          style={{
            fontSize: 8,
            color: "var(--text-body-subtle)",
          }}
        >
          Match
        </span>
      </div>
    </div>
  );
}

// ─── Shared: Phone frame with gradient mesh ─────────────────────
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-full w-full flex-col overflow-hidden"
      style={{
        borderRadius: "2.25rem",
        background: "var(--bg-primary)",
        transform: "translateZ(0)", // stacking context for fixed DomainDetailSheet
      }}
    >
      {/* Gradient mesh background — same as demo layout */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse 140% 45% at 50% -5%, var(--gradient-top) 0%, transparent 65%)",
            "radial-gradient(circle 300px at 15% 75%, var(--gradient-left) 0%, transparent 70%)",
            "radial-gradient(circle 250px at 90% 90%, var(--gradient-right) 0%, transparent 70%)",
            "radial-gradient(ellipse 100% 35% at 50% 105%, var(--gradient-bottom) 0%, transparent 60%)",
          ].join(", "),
        }}
      />
      {children}
    </div>
  );
}

// ─── Glass card wrapper (same as DomainPager card styling) ──────
function GlassCard({
  children,
  cardWidth,
}: {
  children: React.ReactNode;
  cardWidth: number;
}) {
  return (
    <div
      className="overflow-hidden rounded-3xl"
      style={{
        width: cardWidth,
        minWidth: cardWidth,
        height: "100%",
        background: "color-mix(in srgb, var(--card-bg) 70%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 30px rgba(20, 15, 45, 0.35)",
      }}
    >
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMBEDDED OVERALL MOCKUP
// DailyScores section — auto-cycles Yesterday → Today → Tomorrow
// ═══════════════════════════════════════════════════════════════

export function EmbeddedOverallMockup() {
  const { ref, inView } = useInView(0.2);
  const [timeView, setTimeView] = useState<TimeView>("today");
  const [started, setStarted] = useState(false);

  // Measure card container for cardWidth
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCardWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Start when scrolled into view
  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  // Auto-cycle time views
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => {
      setTimeView((prev) => {
        const idx = TIME_VIEWS.indexOf(prev);
        return TIME_VIEWS[(idx + 1) % TIME_VIEWS.length];
      });
    }, CYCLE_INTERVAL);
    return () => clearInterval(interval);
  }, [started]);

  // Derive data from current time view
  const data = dataMap[timeView];
  const deltas = getDeltas(timeView);

  return (
    <PremiumTeaserContext.Provider value={() => {}}>
      <LayoutGroup id="landing-overall">
        <div ref={ref} className="flex h-full w-full flex-col">
          <PhoneFrame>
            <StatusBar />

            {/* TimeControl */}
            <div className="shrink-0 px-5 pt-1 pb-2">
              <TimeControl value={timeView} onChange={setTimeView} />
            </div>

            {/* Card container — single persistent OverallPage (no AnimatePresence
                key-swap). AnimatedNumber handles value transitions natively
                via its prevValue branch, avoiding React 19 Strict Mode issues
                with hasAnimated ref on remount. */}
            <div ref={cardRef} className="relative mx-4 flex-1">
              {cardWidth > 0 && (
                <GlassCard cardWidth={cardWidth}>
                  <OverallPage
                    isActive={started}
                    data={data}
                    deltas={deltas}
                    label={data.label ?? ""}
                    structuredInsight={
                      mockStructuredInsights[timeView].overall
                    }
                    trendData={overallTrendForView[timeView]}
                    cardWidth={cardWidth}
                  />
                </GlassCard>
              )}
            </div>

            {/* PageDots — decorative */}
            <div className="shrink-0">
              <PageDots total={4} active={0} />
            </div>

            <BottomNav />
          </PhoneFrame>
        </div>
      </LayoutGroup>
    </PremiumTeaserContext.Provider>
  );
}

// ═══════════════════════════════════════════════════════════════
// EMBEDDED DOMAIN MOCKUP
// DesignedForClarity section — Love card + auto-opening detail sheet
// ═══════════════════════════════════════════════════════════════

export function EmbeddedDomainMockup() {
  const { ref, inView } = useInView(0.2);
  const [started, setStarted] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  // Measure card container for cardWidth
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardWidth, setCardWidth] = useState(0);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCardWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Start when scrolled into view
  useEffect(() => {
    if (inView && !started) setStarted(true);
  }, [inView, started]);

  // Auto-open detail sheet after 3s, then loop: open 4s → close 2s → open...
  useEffect(() => {
    if (!started) return;

    const openDelay = setTimeout(() => {
      setDetailOpen(true);
    }, 3000);

    return () => clearTimeout(openDelay);
  }, [started]);

  // Loop: when sheet closes, wait 2s then reopen
  useEffect(() => {
    if (!started || detailOpen) return;

    const reopenTimer = setTimeout(() => {
      setDetailOpen(true);
    }, 2000);

    return () => clearTimeout(reopenTimer);
  }, [started, detailOpen]);

  // Today love data
  const data = mockToday;
  const timeView: TimeView = "today";

  return (
    <PremiumTeaserContext.Provider value={() => {}}>
      <LayoutGroup id="landing-domain">
        <div ref={ref} className="flex h-full w-full flex-col">
          <PhoneFrame>
            <StatusBar />

            {/* TimeControl — static on Today */}
            <div className="shrink-0 px-5 pt-1 pb-2">
              <TimeControl value={timeView} onChange={() => {}} />
            </div>

            {/* Card container */}
            <div ref={cardRef} className="relative mx-4 flex-1">
              {cardWidth > 0 && (
                <GlassCard cardWidth={cardWidth}>
                  <DomainPage
                    domain="love"
                    isActive={started}
                    score={data.scores.love.value}
                    trend={data.scores.love.trend}
                    delta={mockDeltas.love}
                    peakHour={data.scores.love.peakHour ?? 12}
                    description={data.scores.love.description}
                    structuredInsight={mockStructuredInsights[timeView].love}
                    trendData={trend7D.love}
                    cardWidth={cardWidth}
                    onDetailTap={() => setDetailOpen(true)}
                  />
                </GlassCard>
              )}
            </div>

            {/* PageDots — love is second dot */}
            <div className="shrink-0">
              <PageDots total={4} active={1} />
            </div>

            <BottomNav />

            {/* DomainDetailSheet — auto-opens */}
            <DomainDetailSheet
              open={detailOpen}
              onClose={() => setDetailOpen(false)}
              domain="love"
              detail={mockDomainDetails[timeView].love}
              score={data.scores.love.value}
              trend={data.scores.love.trend as "rising" | "stable" | "declining"}
              color={domainConfig.love.color}
              onPremiumTap={() => {}}
            />
          </PhoneFrame>
        </div>
      </LayoutGroup>
    </PremiumTeaserContext.Provider>
  );
}
