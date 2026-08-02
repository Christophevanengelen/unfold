"use client";

/**
 * /app/boudin — Full-screen 100-year sausage timeline (phone app only).
 *
 * Shows only the sausage visualization. The yearly stats chart is available
 * on the desktop landing page only (not here — it's too squeezed on mobile).
 * Premium-only — free users are redirected to /app/pricing.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "flowbite-react-icons/outline";
import { usePremiumStatus } from "@/lib/premium-gate";
import { SAFE_TOP } from "@/lib/layout-constants";
import { isNative } from "@/lib/platform";

function hasCouponAccess(): boolean {
  try { return localStorage.getItem("unfold_chart_access") === "true"; } catch { return false; }
}

export default function BoudinPage() {
  const router = useRouter();
  const isPremium = usePremiumStatus();
  const [mounted, setMounted] = useState(false);
  const native = isNative();

  useEffect(() => { setMounted(true); }, []);

  // Don't gate during SSR. Allow access if premium OR has a valid coupon.
  useEffect(() => {
    if (mounted && !isPremium && !hasCouponAccess()) {
      router.replace("/app/pricing");
    }
  }, [mounted, isPremium, router]);

  if (!mounted || (!isPremium && !hasCouponAccess())) {
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
          className="flex h-7 w-7 items-center justify-center rounded-full transition-opacity hover:opacity-70"
          style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
          aria-label="Back"
        >
          <ChevronLeft size={16} style={{ color: "var(--accent-purple)" }} />
        </button>
        <span className="flex-1 text-center text-[12px] font-semibold" style={{ color: "var(--text-body-subtle)" }}>
          Lifetime timeline
        </span>
        <div className="h-7 w-7" />
      </div>

      {/* Sausage iframe — fills remaining height */}
      <iframe
        src="/boudin-sausage.html"
        className="flex-1 border-none"
        title="Your 100-year lifetime sausage timeline"
        allow="same-origin"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
