"use client";

import dynamic from "next/dynamic";

// Use dynamic import for SSR safety but with loading skeleton
// The chunk is prefetched during onboarding, so this is near-instant
const MomentumTimelineV2 = dynamic(
  () => import("@/components/demo/MomentumTimelineV2").then((m) => m.MomentumTimelineV2),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "var(--accent-purple)",
            borderRightColor: "var(--accent-purple)",
            opacity: 0.4,
          }}
        />
      </div>
    ),
  }
);

export default function TimelinePage() {
  return <MomentumTimelineV2 />;
}
