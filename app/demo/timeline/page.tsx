"use client";

import dynamic from "next/dynamic";

const MomentumTimelineV2 = dynamic(
  () => import("@/components/demo/MomentumTimelineV2").then((m) => m.MomentumTimelineV2),
  { ssr: false }
);

export default function TimelinePage() {
  return <MomentumTimelineV2 />;
}
