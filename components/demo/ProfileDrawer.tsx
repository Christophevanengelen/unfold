"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { User, Sun, Moon, AdjustmentsHorizontal, ArrowRightToBracket, ArrowLeftToBracket, CalendarEdit, Globe, Eye } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { PersonalizeFlow } from "@/components/demo/PersonalizeFlow";
import { getUserProfileSync, saveUserProfile } from "@/lib/user-profile";
import { isProfileComplete, type UserProfile } from "@/types/user-profile";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "@/lib/supabase-auth";
import { clearBirthData } from "@/lib/birth-data";
import { AuthSheet } from "@/components/demo/AuthSheet";
import { t, detectLocale, setLocale, LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n-demo";
import { getStreak } from "@/lib/streak";
import { useBillingState } from "@/lib/premium-gate";
import { isNative, getPlatform } from "@/lib/platform";
import { apiFetch } from "@/lib/api-client";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const router = useRouter();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // L apparence a trois etats, comme partout chez Apple : Systeme, Clair,
  // Sombre. Le bouton n en avait que deux : des qu on y touchait, l app cessait
  // definitivement de suivre le telephone. Quelqu un qui bascule son iPhone en
  // sombre le soir gardait une app claire, sans moyen de revenir en arriere.
  const apparence = theme === "light" || theme === "dark" ? theme : "system";
  const apparenceSuivante =
    apparence === "system" ? "light" : apparence === "light" ? "dark" : "system";

  const { birthData } = useMomentum();
  const { user, isAuthenticated } = useAuth();
  const [personalizeOpen, setPersonalizeOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [locale, setLocaleState] = useState<Locale>("en");
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const billing = useBillingState();
  const native = isNative();
  const platform = getPlatform();

  const userName = birthData?.nickname || (locale === "fr" ? "Toi" : locale === "es" ? "Tú" : locale === "pt" ? "Você" : "You");

  useEffect(() => {
    const p = getUserProfileSync();
    setHasProfile(isProfileComplete(p));
    setLocaleState(detectLocale());
  }, [open]);

  const handlePersonalizeComplete = async (profile: UserProfile) => {
    await saveUserProfile(profile);
    setHasProfile(true);
    setPersonalizeOpen(false);
  };

  // La serie vivait dans la barre du haut, supprimee le 31/08/2026. Sa place
  // est ici : c est l ecran ou l on regarde son propre etat.
  const [streak, setStreak] = useState(0);
  useEffect(() => {
    if (open) setStreak(getStreak().count);
  }, [open]);

  return (
    <>
      <BottomSheet open={open} onClose={onClose} maxHeight="60%">
        <div className="px-6 pb-8">
          {/* User info */}
          <div className="flex items-center gap-3 pb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-brand-soft">
              <User size={22} className="text-accent-purple" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-heading">
                {userName}
              </p>
              <p className="text-xs text-text-body-subtle">
                {billing.isPremium
                  ? t("profile.premium_plan", locale)
                  : t("profile.free_plan", locale)}
                {billing.status === "trialing" && (
                  <span className="ml-1.5 rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                    style={{
                      background: "color-mix(in srgb, var(--accent-purple) 15%, transparent)",
                      color: "var(--accent-purple)",
                    }}
                  >Trial</span>
                )}
              </p>
              {streak >= 2 && (
                <p className="mt-0.5 text-[11px] font-semibold" style={{ color: "var(--accent-purple)" }}>
                  {t("profile.streak_day", locale).replace("{n}", String(streak))}
                </p>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="mb-4 h-px bg-brand-3" />

          {/* Settings */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.settings", locale)}
          </p>

          {/* Personalize */}
          <button
            type="button"
            onClick={() => { onClose(); setTimeout(() => setPersonalizeOpen(true), 300); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <AdjustmentsHorizontal size={16} className="text-accent-purple" />
              {t("profile.personalize", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {hasProfile ? t("profile.edit", locale) : t("profile.configure", locale)}
            </span>
          </button>

          {/* Edit birth data */}
          <button
            type="button"
            onClick={() => { onClose(); router.push("/app/onboarding"); }}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <CalendarEdit size={16} className="text-accent-purple" />
              {t("profile.edit_birth", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {birthData?.birthDate ? t("profile.edit", locale) : t("profile.configure", locale)}
            </span>
          </button>

          {/* Full timeline chart — premium only */}
          {billing.isPremium && (
            <button
              type="button"
              onClick={() => { onClose(); router.push("/app/boudin"); }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
            >
              <span className="flex items-center gap-2.5">
                <Eye size={16} className="text-accent-purple" />
                Full timeline chart
              </span>
              <span className="text-[10px] font-semibold" style={{ color: "var(--accent-purple)", opacity: 0.7 }}>
                Sausage
              </span>
            </button>
          )}

          {/* Language picker */}
          <button
            type="button"
            onClick={() => setLangPickerOpen(true)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              <Globe size={16} className="text-text-body-subtle" />
              {t("profile.language", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {LOCALE_LABELS[locale]}
            </span>
          </button>

          {/* Theme toggle */}
          <button
            type="button"
            onClick={() => setTheme(apparenceSuivante)}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
          >
            <span className="flex items-center gap-2.5">
              {isDark ? (
                <Moon size={16} className="text-text-body-subtle" />
              ) : (
                <Sun size={16} className="text-text-body-subtle" />
              )}
              {t("profile.appearance", locale)}
            </span>
            <span className="text-xs text-text-body-subtle">
              {apparence === "system"
                ? t("profile.systeme", locale)
                : apparence === "dark"
                  ? t("profile.dark", locale)
                  : t("profile.light", locale)}
            </span>
          </button>

          {/* Subscription management — only when authenticated */}
          {isAuthenticated && (
            <>
              <div className="my-4 h-px bg-brand-3" />
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
                {t("profile.your_plan", locale)}
              </p>

              {/* Manage subscription */}
              <button
                type="button"
                onClick={() => {
                  if (native) {
                    // Native iOS → Apple subscriptions page
                    // Native Android → Google Play subscriptions
                    const url = platform === "ios"
                      ? "https://apps.apple.com/account/subscriptions"
                      : "https://play.google.com/store/account/subscriptions";
                    if (typeof window !== "undefined") {
                      // "_system" opens in the native browser on iOS/Android
                      window.open(url, "_system");
                    }
                  } else {
                    // Web → Stripe Customer Portal
                    apiFetch("/api/billing/portal", { method: "POST", credentials: "include" })
                      .then((r) => r.ok ? r.json() : null)
                      .then((data) => { if (data?.url) window.location.href = data.url; })
                      .catch(() => {});
                    onClose();
                  }
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-4 w-4 items-center justify-center text-accent-purple text-xs">✦</span>
                  {t("profile.manage_sub", locale)}
                </span>
                <span className="text-xs text-text-body-subtle">
                  {billing.isPremium ? t("profile.premium_plan", locale) : t("profile.free_plan", locale)}
                </span>
              </button>

              {/* Restore purchases — native only */}
              {native && (
                <button
                  type="button"
                  onClick={async () => {
                    // Phase 4: will call Purchases.restorePurchases() via RC SDK
                    // For now, just refetch /api/billing/me to sync state
                    await apiFetch("/api/billing/me", { credentials: "include" });
                    window.dispatchEvent(new CustomEvent("unfold:plan-changed", { detail: billing.isPremium ? "premium" : "free" }));
                    onClose();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
                >
                  <span className="flex h-4 w-4 items-center justify-center text-text-body-subtle text-xs">↩</span>
                  {t("profile.restore_purchases", locale)}
                </button>
              )}
            </>
          )}

          {/* Divider */}
          <div className="my-4 h-px bg-brand-3" />

          {/* Auth section */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.account", locale)}
          </p>

          {isAuthenticated ? (
            <>
              <p className="px-3 mb-2 text-xs text-text-body-subtle truncate">
                {user?.email}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  clearBirthData();
                  onClose();
                  router.push("/app/onboarding");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
              >
                <ArrowLeftToBracket size={16} className="text-text-body-subtle" />
                {t("profile.sign_out", locale)}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); setTimeout(() => setAuthOpen(true), 300); }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
            >
              <ArrowRightToBracket size={16} className="text-accent-purple" />
              {t("profile.sign_in", locale)}
            </button>
          )}
        </div>
      </BottomSheet>

      {/* Language picker bottom sheet */}
      <BottomSheet open={langPickerOpen} onClose={() => setLangPickerOpen(false)} maxHeight="60%">
        <div className="px-6 pb-8">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
            {t("profile.language", locale)}
          </p>
          <div className="space-y-1">
            {SUPPORTED_LOCALES.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => {
                  setLocale(loc);
                  setLocaleState(loc);
                  setLangPickerOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
                style={{
                  background: loc === locale ? "color-mix(in srgb, var(--accent-purple) 10%, transparent)" : undefined,
                }}
              >
                <span>{LOCALE_LABELS[loc]}</span>
                {loc === locale && (
                  <span className="text-xs font-bold" style={{ color: "var(--accent-purple)" }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      {/* Personalize flow */}
      <PersonalizeFlow
        open={personalizeOpen}
        onClose={() => setPersonalizeOpen(false)}
        onComplete={handlePersonalizeComplete}
      />

      {/* Auth sheet */}
      <AuthSheet
        open={authOpen}
        onClose={() => setAuthOpen(false)}
      />
    </>
  );
}
