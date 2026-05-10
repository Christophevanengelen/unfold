"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setPremiumStatus } from "@/lib/premium-gate";

/**
 * /demo — Root redirect.
 *
 * Also handles post-Stripe-checkout return:
 *   /demo?checkout=success  → set premium flag, redirect to /demo/timeline?checkout=success
 *   /demo?checkout=cancelled → redirect to /demo/pricing
 *   (default)               → redirect to /demo/timeline
 */
export default function DemoPage() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const checkout = params.get("checkout");
    if (checkout === "success") {
      // Optimistically mark premium while webhook processes (server confirms on next /api/billing/me fetch)
      setPremiumStatus("premium");
      router.replace("/demo/timeline?checkout=success");
    } else if (checkout === "cancelled") {
      router.replace("/demo/pricing?checkout=cancelled");
    } else {
      router.replace("/demo/timeline");
    }
  }, [router, params]);

  return null;
}
