"use client";

/**
 * /app/boudin — Full-screen 100-year sausage timeline (phone app only).
 *
 * Shows only the sausage visualization. The yearly stats chart is available
 * on the desktop landing page only (not here — it's too squeezed on mobile).
 * Premium-only — free users are redirected to /app/pricing.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "flowbite-react-icons/outline";
import { usePremiumStatus } from "@/lib/premium-gate";
import { SAFE_TOP } from "@/lib/layout-constants";
import { isNative } from "@/lib/platform";
import { t } from "@/lib/i18n-demo";
import { useLocale } from "@/lib/use-locale";
import { useHydrate } from "../_hydrate";

function hasCouponAccess(): boolean {
  try { return localStorage.getItem("unfold_chart_access") === "true"; } catch { return false; }
}

export default function BoudinPage() {
  const router = useRouter();
  const locale = useLocale();
  const isPremium = usePremiumStatus();
  const native = isNative();
  // hasCouponAccess() lit localStorage : le serveur ne peut pas repondre. Ce
  // booleen remplace le couple useState/useEffect qui allumait « mounted »
  // apres le montage — meme deux passes, mais declarees a React au lieu de lui
  // etre imposees par un setState dans un effet. Voir _hydrate.ts.
  const monte = useHydrate();

  // Don't gate during SSR. Allow access if premium OR has a valid coupon.
  useEffect(() => {
    if (monte && !isPremium && !hasCouponAccess()) {
      router.replace("/app/pricing");
    }
  }, [monte, isPremium, router]);

  if (!monte || (!isPremium && !hasCouponAccess())) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)", opacity: 0.5 }}
        />
      </div>
    );
  }

  const safeTop = native ? "env(safe-area-inset-top, 48px)" : `${SAFE_TOP}px`;

  return (
    <div className="flex h-full flex-col" style={{ paddingTop: safeTop }}>
      {/* Minimal header — just back button + title */}
      <div
        className="flex shrink-0 items-center gap-3 px-4 py-2"
        style={{
          background: "var(--glass-bg)",
          borderBottom: "1px solid var(--glass-border)",
          backdropFilter: "blur(var(--glass-blur))",
        }}
      >
        <button
          type="button"
          onClick={() => router.back()}
          // Zone etendue plutot que h-11 : ce bouton vit dans une barre de
          // 28 px de haut, l agrandir pousserait toute la barre. Le carre
          // dessine reste a 28, la zone touchable fait 28 + 2x8 = 44.
          className="relative flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70 before:absolute before:-inset-2 before:content-['']"
          style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
          aria-label={t("common.back", locale)}
        >
          <ChevronLeft size={16} style={{ color: "var(--accent-purple)" }} />
        </button>
        <span className="flex-1 text-center text-[12px] font-semibold" style={{ color: "var(--text-body-subtle)" }}>
          {t("boudin.titre", locale)}
        </span>
        <div className="h-7 w-7" />
      </div>

      {/* Sausage iframe — fills remaining height */}
      <iframe
        src="/boudin-sausage.html"
        className="flex-1 border-none"
        title={t("boudin.titre", locale)}
        allow="same-origin"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
