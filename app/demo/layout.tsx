"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UnfoldLogo } from "@/components/demo/UnfoldLogo";
import { BottomNav } from "@/components/demo/BottomNav";
import { ProfileDrawer } from "@/components/demo/ProfileDrawer";
import { PremiumTeaser } from "@/components/demo/PremiumTeaser";
import { PremiumTeaserContext } from "@/components/demo/PremiumTeaserContext";
import { MomentumProvider } from "@/lib/momentum-store";
import { OnboardingGuard } from "@/components/demo/OnboardingGuard";
import { SAFE_TOP, SAFE_BOTTOM } from "@/lib/layout-constants";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  // Prevent SSR flash — demo is 100% client-side (API data, IndexedDB, etc.)
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Hide bottom nav on onboarding/invite flows
  const HIDDEN_NAV_ROUTES = ["/demo/onboarding", "/demo/invite"];
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = pathname.startsWith("/demo/onboarding");
  const isHome = pathname === "/demo";
  const isTimeline = pathname === "/demo/timeline";
  // Full-bleed routes manage their own padding and scroll
  const isFullBleed = isHome || isTimeline;

  // Smooth fade transition on route change
  const [pageReady, setPageReady] = useState(true);
  const prevPath = useRef(pathname);
  useEffect(() => {
    if (prevPath.current !== pathname) {
      setPageReady(false);
      prevPath.current = pathname;
      // Let CSS opacity transition play, then reveal
      const t = setTimeout(() => setPageReady(true), 20);
      return () => clearTimeout(t);
    }
  }, [pathname]);

  // SSR: render only the dark background — no content, no flash
  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#110D24" }} />;
  }

  return (
    <MomentumProvider>
    <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#110D24" }}>
      {/* Mobile frame */}
      <div
        className="relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border border-brand-6/40 bg-bg-primary"
        style={{
          transform: "translateZ(0)",
        }}
      >
        {/* Subtle ambient depth — monochrome purple only */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 120% 40% at 50% 0%, rgba(124, 107, 191, 0.10) 0%, transparent 60%)",
          }}
        />

        {/* Content — full height, nav overlays float on top */}
        <PremiumTeaserContext.Provider value={() => setPremiumOpen(true)}>
          <div
            className={`flex-1 ${
              isFullBleed
                ? "relative z-10 overflow-hidden"
                : "overflow-y-auto overflow-x-hidden px-5 scrollbar-none"
            }`}
            style={{
              "--safe-top": `${SAFE_TOP}px`,
              "--safe-bottom": `${SAFE_BOTTOM}px`,
              ...(!isFullBleed ? { paddingTop: `${SAFE_TOP}px`, paddingBottom: `${SAFE_BOTTOM}px` } : {}),
              opacity: pageReady ? 1 : 0,
              transition: "opacity var(--transition-page, 180ms ease-out)",
            } as React.CSSProperties}
          >
            {isOnboarding ? children : <OnboardingGuard>{children}</OnboardingGuard>}
          </div>
        </PremiumTeaserContext.Provider>

        {/* Status bar — absolute overlay so content scrolls behind */}
        {!hideNav && (
          <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 pt-3 pb-2" style={{
            background: "var(--glass-bg)",
            borderBottom: "1px solid var(--glass-border)",
            backdropFilter: `blur(var(--glass-blur))`,
          }}>
            <span className="text-xs font-medium" style={{ color: "var(--accent-purple)", opacity: 0.5 }}>
              9:41
            </span>
            <UnfoldLogo size={22} />
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-bg-brand-soft text-[10px] font-bold text-accent-purple transition-transform hover:scale-105 active:scale-95"
              aria-label="Profile"
            >
              A
            </button>
          </div>
        )}

        {/* Bottom nav — absolute overlay so content scrolls behind */}
        {!hideNav && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <BottomNav />
          </div>
        )}

        {/* Profile drawer */}
        <ProfileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />

        {/* Premium teaser */}
        <PremiumTeaser
          open={premiumOpen}
          onClose={() => setPremiumOpen(false)}
        />
      </div>

      {/* Exit link — subtle, bottom right */}
      <a
        href="/en#pricing"
        className="absolute bottom-2 right-4 text-[10px] text-white/20 hover:text-white/40 transition-colors"
      >
        unfold.app
      </a>
    </div>
    </MomentumProvider>
  );
}
