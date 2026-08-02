"use client";

import { Skeleton } from "@/components/ui/Skeleton";

export default function DemoLoading() {
  return (
    <div className="flex h-full flex-col gap-6 py-2">
      {/* Greeting skeleton */}
      <Skeleton width="w-24" height="h-4" />

      {/* Segmented control skeleton */}
      <div className="h-9 rounded-full bg-bg-secondary" />

      {/* Hero score skeleton */}
      <div className="flex flex-col items-center py-4">
        <div
          className="rounded-full bg-bg-secondary"
          style={{ width: 140, height: 140 }}
        />
        <Skeleton width="w-20" height="h-3" className="mt-3" />
      </div>

      {/* Dimension rows skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-bg-secondary" />
            <Skeleton width="w-12" height="h-3" />
            <Skeleton width="w-8" height="h-6" />
            <Skeleton width="w-8" height="h-3" />
            <div className="ml-auto">
              <Skeleton width="w-14" height="h-4" />
            </div>
          </div>
        ))}
      </div>

      {/* Insight skeleton */}
      <div className="rounded-2xl bg-bg-secondary p-5">
        <Skeleton width="w-16" height="h-2" className="mb-3" />
        <Skeleton width="w-full" height="h-3" className="mb-2" />
        <Skeleton width="w-3/4" height="h-3" />
      </div>
    </div>
  );
}
