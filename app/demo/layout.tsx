"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { UnfoldLogo } from "@/components/demo/UnfoldLogo";
import { BottomNav } from "@/components/demo/BottomNav";
import { ProfileDrawer } from "@/components/demo/ProfileDrawer";
import { PremiumTeaser } from "@/components/demo/PremiumTeaser";
import { PremiumTeaserContext } from "@/components/demo/PremiumTeaserContext";

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  // Hide bottom nav on onboarding/invite flows
  const HIDDEN_NAV_ROUTES = ["/demo/onboarding", "/demo/invite"];
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));
  const isHome = pathname === "/demo";

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-3 p-4">
      {/* Mobile frame */}
      <div
        className="relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border border-brand-6/40 bg-bg-primary"
        style={{
          boxShadow:
            "0 8px 40px rgba(124, 107, 191, 0.15), 0 2px 12px rgba(0, 0, 0, 0.08)",
        }}
      >
        {/* Gradient background layer — ambient mesh glow */}
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

        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-2">
          <span className="text-xs font-medium text-text-body-subtle">
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

        {/* Content — full width for swipe pages, padded for other routes */}
        <PremiumTeaserContext.Provider value={() => setPremiumOpen(true)}>
          <div
            className={`flex-1 ${
              isHome
                ? "relative z-10"
                : "overflow-y-auto overflow-x-hidden px-5 py-3"
            }`}
          >
            {children}
          </div>
        </PremiumTeaserContext.Provider>

        {/* Bottom nav (hidden on flows) */}
        {!hideNav && <BottomNav />}

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
    </div>
  );
}
