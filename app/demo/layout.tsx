"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { UnfoldLogo } from "@/components/demo/UnfoldLogo";
import { BottomNav } from "@/components/demo/BottomNav";
import { ProfileDrawer } from "@/components/demo/ProfileDrawer";
import { PremiumTeaser } from "@/components/demo/PremiumTeaser";
import { PremiumTeaserContext } from "@/components/demo/PremiumTeaserContext";
import { MomentumProvider } from "@/lib/momentum-store";
import { OnboardingGuard } from "@/components/demo/OnboardingGuard";
import { AuthProvider } from "@/lib/auth-context";
import { useAuth } from "@/lib/auth-context";
import { SAFE_TOP, SAFE_BOTTOM } from "@/lib/layout-constants";
import { checkAndUpdateStreak } from "@/lib/streak";
import { detectLocale, isRTL, t, type Locale } from "@/lib/i18n-demo";
import { useBillingState } from "@/lib/premium-gate";
import { isIOSBundle } from "@/lib/platform";

/** Shows "J-2" or "2d left" pill when trial ends within 3 days. Web + Android only. */
function TrialCountdownPill({
  trialEnd,
  onClick,
}: {
  trialEnd: string;
  onClick: () => void;
}) {
  const daysLeft = Math.ceil(
    (new Date(trialEnd).getTime() - Date.now()) / 86_400_000
  );
  if (daysLeft < 0 || daysLeft > 3) return null;
  const locale = detectLocale();
  const label = t("profile.trial_ends_in", locale).replace("{n}", String(daysLeft));
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full px-2 py-0.5 text-[9px] font-semibold"
      style={{
        background: "color-mix(in srgb, var(--accent-purple) 18%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)",
        color: "var(--accent-purple)",
        letterSpacing: "0.02em",
      }}
    >
      {label}
    </button>
  );
}

function AvatarButton({ onClick }: { onClick: () => void }) {
  const { user, isAuthenticated } = useAuth();
  const initial = isAuthenticated && user?.email ? user.email[0].toUpperCase() : "A";
  return (
    <button
      onClick={onClick}
      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-bg-brand-soft text-[10px] font-bold text-accent-purple transition-transform hover:scale-105 active:scale-95"
      aria-label="Profile"
    >
      {initial}
      {isAuthenticated && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-green-400 ring-1 ring-bg-primary" />
      )}
    </button>
  );
}

/**
 * Capacitor detection — true when running inside native app shell.
 * Enables fullscreen mode (no phone frame, real safe areas).
 */
function useIsNative() {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    const native =
      typeof window !== "undefined" &&
      ("Capacitor" in window || process.env.NEXT_PUBLIC_NATIVE === "true");
    setIsNative(native);
  }, []);
  return isNative;
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isNative = useIsNative();
  const { resolvedTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const billing = useBillingState();
  const ios = isIOSBundle();

  // Prevent SSR flash — demo is 100% client-side (API data, IndexedDB, etc.)
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    setMounted(true);
    setStreak(checkAndUpdateStreak());

    // Native-only: hide splash screen on first render
    if (typeof window !== "undefined" && window.Capacitor) {
      import("@capacitor/splash-screen").then(({ SplashScreen }) => {
        // Fade out splash (launchAutoHide:false means we control this)
        SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
      });
    }
  }, []);

  // Native-only: sync iOS StatusBar style with current theme
  // Runs on mount and whenever user toggles Appearance
  useEffect(() => {
    if (typeof window === "undefined" || !window.Capacitor) return;
    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      const isDark = resolvedTheme !== "light";
      // Dark mode → white text/icons on dark bg; Light mode → dark text/icons on light bg
      StatusBar.setStyle({ style: isDark ? Style.Light : Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: isDark ? "#1B1535" : "#F5F1FA" }).catch(() => {});
    });
  }, [resolvedTheme]);

  // Sync HTML lang + dir attributes with detected/picked user locale.
  // Runs on mount and whenever the language picker emits a change event.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const apply = (loc: Locale) => {
      document.documentElement.lang = loc;
      document.documentElement.dir = isRTL(loc) ? "rtl" : "ltr";
    };
    apply(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) apply(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

  // Listen for custom events
  useEffect(() => {
    const handlePremium = () => setPremiumOpen(true);
    const handlePersonalize = () => setDrawerOpen(true); // opens ProfileDrawer which has PersonalizeFlow
    window.addEventListener("unfold:show-premium", handlePremium);
    window.addEventListener("unfold:show-personalize", handlePersonalize);
    return () => {
      window.removeEventListener("unfold:show-premium", handlePremium);
      window.removeEventListener("unfold:show-personalize", handlePersonalize);
    };
  }, []);

  // Hide bottom nav on onboarding/invite flows
  const HIDDEN_NAV_ROUTES = ["/demo/onboarding", "/demo/invite"];
  const hideNav = HIDDEN_NAV_ROUTES.some((r) => pathname.startsWith(r));
  const isOnboarding = pathname.startsWith("/demo/onboarding");
  const isHome = pathname === "/demo";
  const isTimeline = pathname === "/demo/timeline";
  // Full-bleed routes manage their own padding and scroll
  const isFullBleed = isHome || isTimeline || isOnboarding;


  // SSR: render only the dark background — no content, no flash
  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "#110D24" }} />;
  }

  // Native: fullscreen, real safe areas
  // Web: phone frame mockup (375x812)
  const frameClasses = isNative
    ? "relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-primary"
    : "relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border border-brand-6/40 bg-bg-primary";

  const safeTop = isNative ? "env(safe-area-inset-top, 48px)" : `${SAFE_TOP}px`;
  const safeBottom = isNative ? "env(safe-area-inset-bottom, 34px)" : `${SAFE_BOTTOM}px`;

  return (
    <AuthProvider>
    <MomentumProvider>
    <div className={isNative ? "h-[100dvh] w-full" : "flex min-h-screen items-center justify-center p-4"} style={{ backgroundColor: "#110D24" }}>
      {/* Mobile frame (conditional) */}
      <div
        className={frameClasses}
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
                ? "relative overflow-hidden"
                : "overflow-y-auto overflow-x-hidden px-5 scrollbar-none"
            }`}
            style={{
              "--safe-top": safeTop,
              "--safe-bottom": safeBottom,
              ...(!isFullBleed ? { paddingTop: safeTop, paddingBottom: safeBottom } : {}),
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
            <div className="flex items-center gap-2">
              {/* Trial countdown — web + Android only (anti-steering iOS) */}
              {!ios && billing.status === "trialing" && billing.trialEnd && (
                <TrialCountdownPill
                  trialEnd={billing.trialEnd}
                  onClick={() => router.push("/demo/pricing")}
                />
              )}
              {streak >= 2 && (
                <span
                  className="text-[9px] font-semibold tabular-nums"
                  style={{ color: "var(--accent-purple)", opacity: 0.6 }}
                >
                  Jour {streak}
                </span>
              )}
              <AvatarButton onClick={() => setDrawerOpen(true)} />
            </div>
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

      {/* Exit link — only in web frame mode */}
      {!isNative && (
        <a
          href="/en#pricing"
          className="absolute bottom-2 right-4 text-[10px] text-white/20 hover:text-white/40 transition-colors"
        >
          unfold.app
        </a>
      )}
    </div>
    </MomentumProvider>
    </AuthProvider>
  );
}
