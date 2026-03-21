"use client";

/**
 * Monthly View page — Tab 2 in the bottom nav.
 *
 * Shows the toctoc-year data: current month, peak upcoming months,
 * year summaries. Uses the fast endpoint (2-10s).
 */

import { MonthlyView } from "@/components/demo/MonthlyView";
import { mockTocTocYear } from "@/lib/mock-data";

export default function MonthlyPage() {
  return <MonthlyView data={mockTocTocYear} />;
}
