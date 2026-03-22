"use client";

import dynamic from "next/dynamic";

const SignalPager = dynamic(
  () => import("@/components/demo/SignalPager").then((m) => m.SignalPager),
  { ssr: false }
);

export default function MomentumView() {
  return <SignalPager />;
}
