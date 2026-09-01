"use client";

import { useState, useEffect } from "react";
import { mesurer, mesurerUneFois } from "@/lib/mesure";
import { brancherEcoutes } from "@/lib/push";
import { cheminDepuisNotification } from "@/lib/push-routes";
import { brancherLiensProfonds } from "@/lib/deep-links";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
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
  // Use first letter of email when logged in, otherwise a neutral person icon
  const initial = isAuthenticated && user?.email ? user.email[0].toUpperCase() : null;
  return (
    <button
      onClick={onClick}
      className="relative flex h-6 w-6 items-center justify-center rounded-full bg-bg-brand-soft text-[10px] font-bold text-accent-purple transition-transform hover:scale-105 active:scale-95"
      aria-label="Profile"
    >
      {initial ?? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        </svg>
      )}
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
  // Read ?desktop=1 client-side only: useSearchParams() in this layout
  // forced the whole /app tree to bail out of SSR (blank first paint).
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    try {
      setIsDesktop(new URLSearchParams(window.location.search).get("desktop") === "1");
    } catch { /* noop */ }
  }, []);
  const isNative = useIsNative() || isDesktop;
  const { resolvedTheme } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");
  const billing = useBillingState();
  const ios = isIOSBundle();

  // Prevent SSR flash — demo is 100% client-side (API data, IndexedDB, etc.)
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    mesurer("app_ouverte");
    setMounted(true);
    // Enregistre la visite du jour. L affichage de la serie a demenage dans le
    // tiroir profil avec la barre du haut, mais le COMPTAGE doit rester ici :
    // c est l ouverture de l app qui fait la serie, pas l ouverture du tiroir.
    // Retirer cet appel avec l affichage aurait fige la serie a zero.
    checkAndUpdateStreak();

    // Native-only: hide splash screen on first render
    if (typeof window !== "undefined" && window.Capacitor) {
      import("@capacitor/splash-screen").then(({ SplashScreen }) => {
        // Fade out splash (launchAutoHide:false means we control this)
        SplashScreen.hide({ fadeOutDuration: 300 }).catch(() => {});
      });
    }
  }, []);

  // Notifications : toucher une notification ouvre la periode concernee, jamais
  // l accueil. On navigue avec le routeur et non avec location.href : le
  // serveur interne de Capacitor ne sert pas l index d un dossier, une
  // navigation dure retomberait sur la page racine (voir CLAUDE.md).
  // L evenement est conserve par le greffon jusqu a ce qu un ecouteur existe,
  // donc un demarrage a froid n est pas une course.
  useEffect(() => {
    let debrancher: (() => void) | undefined;
    void brancherEcoutes((donnees) => {
      const chemin = cheminDepuisNotification(donnees);
      if (chemin) router.push(chemin);
    }).then((f) => {
      debrancher = f;
    });
    return () => debrancher?.();
  }, [router]);

  // Liens magiques. Le schema unfold:// etait declare mais personne ne
  // l ecoutait : le jeton partait a la poubelle et la personne se retrouvait
  // devant l accueil, pas connectee, sans message. On rafraichit l ecran a la
  // connexion pour qu elle voie son compte apparaitre.
  useEffect(() => {
    let debrancher: (() => void) | undefined;
    void brancherLiensProfonds(() => router.refresh()).then((f) => {
      debrancher = f;
    });
    return () => debrancher?.();
  }, [router]);

  // Native-only: sync iOS StatusBar style with current theme
  // Runs on mount and whenever user toggles Appearance
  useEffect(() => {
    if (typeof window === "undefined" || !window.Capacitor) return;
    import("@capacitor/status-bar").then(({ StatusBar, Style }) => {
      const isDark = resolvedTheme !== "light";
      // Attention au nommage du greffon : Style.Dark veut dire « texte clair, pour
      // un fond sombre », et Style.Light « texte sombre, pour un fond clair ». La
      // ligne d avant faisait exactement l inverse, donc l heure et la batterie
      // etaient illisibles dans les deux themes. Verifie au pixel le 31/08/2026.
      StatusBar.setStyle({ style: isDark ? Style.Dark : Style.Light }).catch(() => {});
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
    const current = detectLocale();
    apply(current);
    setLocaleState(current);
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) { apply(detail); setLocaleState(detail); }
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
  const HIDDEN_NAV_ROUTES = ["/app/onboarding", "/app/invite"];
  // En natif, l export statique ajoute une barre finale (trailingSlash: true
  // dans next.config.ts), donc pathname vaut "/app/timeline/" et jamais
  // "/app/timeline". Les deux comparaisons strictes ci-dessous tombaient a faux
  // dans l app : la timeline et l accueil n etaient pas traites en pleine
  // largeur et heritaient d un retrait de 20 points de chaque cote, plus les
  // marges haute et basse. C est ce qui donnait l impression que l app tournait
  // dans un cadre. Mesure le 31/08/2026 : conteneur a 362 points au lieu de 402.
  const route = pathname.replace(/\/index\.html$/, "").replace(/\/+$/, "") || "/";

  const hideNav = HIDDEN_NAV_ROUTES.some((r) => route.startsWith(r));
  const isOnboarding = route.startsWith("/app/onboarding");
  const isHome = route === "/app";
  const isTimeline = route === "/app/timeline";
  // Full-bleed routes manage their own padding and scroll
  const isFullBleed = isHome || isTimeline || isOnboarding;


  // Onboarding funnel: render immediately, INCLUDING at SSR.
  // A first-time visitor must see the promise screen at first paint — the
  // previous mounted-gate shipped an empty dark div until the whole app
  // bundle hydrated (37 s of black screen on cold 3G + mid CPU, measured).
  // This branch is stable pre/post mount (no nav, no drawer on onboarding),
  // so there is no hydration mismatch and no flash.
  if (isOnboarding) {
    const obFrameClasses = isNative
      ? "relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg-primary"
      : "relative flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border border-brand-6/40 bg-bg-primary";
    const obSafeTop = isNative ? "env(safe-area-inset-top, 48px)" : `${SAFE_TOP}px`;
    const obSafeBottom = isNative ? "env(safe-area-inset-bottom, 34px)" : `${SAFE_BOTTOM}px`;
    return (
      <AuthProvider>
        <MomentumProvider>
          <div
            className={isNative ? "h-[100dvh] w-full" : "flex min-h-screen items-center justify-center p-4"}
            style={{ backgroundColor: "var(--bg-primary)" }}
          >
            <div
              className={obFrameClasses}
              style={{
                transform: "translateZ(0)",
                "--safe-top": obSafeTop,
                "--safe-bottom": obSafeBottom,
              } as React.CSSProperties}
            >
              <div
                className="pointer-events-none absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    "radial-gradient(ellipse 120% 40% at 50% 0%, rgba(124, 107, 191, 0.10) 0%, transparent 60%)",
                }}
              />
              <PremiumTeaserContext.Provider value={() => setPremiumOpen(true)}>
                <div className="relative flex-1 overflow-hidden">
                  {children}
                </div>
              </PremiumTeaserContext.Provider>
            </div>
          </div>
        </MomentumProvider>
      </AuthProvider>
    );
  }

  // SSR: render only the dark background — no content, no flash
  if (!mounted) {
    return <div className="flex min-h-screen items-center justify-center p-4" style={{ backgroundColor: "var(--bg-primary)" }} />;
  }

  // Full-screen standalone report pages — bypass phone chrome entirely
  const REPORT_ROUTES = ["/app/birthday-graph", "/app/spirit-wave", "/app/lifetime-chart"];
  if (REPORT_ROUTES.some((r) => route.startsWith(r))) {
    return (
      <AuthProvider>
        <MomentumProvider>
          {children}
        </MomentumProvider>
      </AuthProvider>
    );
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
    <div className={isNative ? "h-[100dvh] w-full" : "flex min-h-screen items-center justify-center p-4"} style={{ backgroundColor: "var(--bg-primary)" }}>
      {/* Mobile frame (conditional) */}
      <div
        className={frameClasses}
        style={{
          transform: "translateZ(0)",
          "--safe-top": safeTop,
          "--safe-bottom": safeBottom,
        } as React.CSSProperties}
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
            style={
              !isFullBleed
                ? { paddingTop: "var(--safe-top)", paddingBottom: "var(--safe-bottom)" }
                // Pleine largeur : le contenu passe SOUS l ile et defile
                // derriere, comme le fait iOS partout. Une marge haute ici
                // coupait le haut des boudins au lieu de les laisser glisser
                // dessous. Ce sont les elements poses en haut, s il y en a, qui
                // doivent lire var(--safe-top), pas le conteneur qui defile.
                : undefined
            }
          >
            {isOnboarding ? children : <OnboardingGuard>{children}</OnboardingGuard>}
          </div>
        </PremiumTeaserContext.Provider>

        {/* Barre du haut : maquette web uniquement. En natif elle doublait la
            barre du systeme sans rien apporter (un logo, et le profil qui est
            desormais un onglet). Le compteur de serie et la pastille d essai
            attendent une nouvelle place : voir le registre du chantier. */}
        {/* La barre du haut est retiree, sur le web comme dans l app.
            Elle avait ete supprimee du natif le 31 aout, et le web l avait
            gardee — deux designs qui divergeaient pour un meme produit, ce que
            Christophe a repere en ouvrant l apercu telephone.

            Ce qu elle portait a trouve sa place ailleurs :
              le bouton profil ....... la barre du bas en a un onglet
              le compteur de serie ... le tiroir profil
              le decompte d essai .... le tiroir profil, deplace ici meme
              le logo ................ personne ne lit un logo dans sa propre app
              la fausse heure 9:41 ... elle se posait sous la vraie horloge du
                                       systeme, et Apple interdit d imiter les
                                       elements du systeme

            Le gain n est pas seulement esthetique : c est une bande de
            cinquante points rendue au contenu, sur chaque ecran. */}

        {/* Bottom nav — absolute overlay so content scrolls behind */}
        {!hideNav && (
          <div className="absolute bottom-0 left-0 right-0 z-30">
            <BottomNav
              onProfile={() => setDrawerOpen(true)}
              profileActive={drawerOpen}
            />
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
