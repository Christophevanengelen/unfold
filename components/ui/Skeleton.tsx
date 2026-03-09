"use client";

interface SkeletonProps {
  /** Width class (Tailwind) */
  width?: string;
  /** Height class (Tailwind) */
  height?: string;
  /** Border radius — "full" for circle, "xl" for cards */
  rounded?: string;
  /** Additional CSS class */
  className?: string;
}

/**
 * Purple-tinted shimmer loading placeholder.
 * Matches Unfold's mauve design system.
 */
export function Skeleton({
  width = "w-full",
  height = "h-4",
  rounded = "rounded-lg",
  className = "",
}: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer bg-gradient-to-r from-brand-2 via-brand-3 to-brand-2 bg-[length:200%_100%] ${width} ${height} ${rounded} ${className}`}
    />
  );
}

/** Circle skeleton for score rings */
export function SkeletonRing({
  size = 80,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`animate-shimmer rounded-full bg-gradient-to-r from-brand-2 via-brand-3 to-brand-2 bg-[length:200%_100%] ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** Card skeleton */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-xl border border-border-light bg-bg-secondary p-4 ${className}`}
    >
      <Skeleton width="w-16" height="h-3" className="mb-3" />
      <Skeleton width="w-full" height="h-3" className="mb-2" />
      <Skeleton width="w-3/4" height="h-3" />
    </div>
  );
}
