/**
 * Shared animation presets for Unfold
 * Built on Motion (formerly Framer Motion) — spring physics for premium feel
 */

import type { Transition, Variants } from "motion/react";

// ─── Spring Configs ───────────────────────────────────────
export const springs = {
  /** Default — smooth, slightly bouncy */
  default: { type: "spring", stiffness: 300, damping: 30 } as Transition,
  /** Gentle — slower settle, elegant */
  gentle: { type: "spring", stiffness: 200, damping: 25 } as Transition,
  /** Bouncy — playful entrance */
  bouncy: { type: "spring", stiffness: 400, damping: 20 } as Transition,
  /** Snappy — fast and precise */
  snappy: { type: "spring", stiffness: 500, damping: 35 } as Transition,
} as const;

// ─── Shared Variants ──────────────────────────────────────

/** Fade in from below — sections, cards */
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springs.default,
  },
};

/** Scale in — cards, modals */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: springs.default,
  },
};

/** Slide in with bounce — badges, chips */
export const slideInBounce: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.bouncy,
  },
};

/** Stagger children — use on parent container */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

/** Stagger children — faster for dense lists */
export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

// ─── Animation Durations ──────────────────────────────────
export const durations = {
  /** Score counter 0 → target */
  countUp: 1.8,
  /** SVG ring fill */
  ringFill: 2.0,
  /** Sparkline draw */
  drawLine: 1.6,
  /** Shimmer cycle */
  shimmer: 1.5,
  /** Page transition */
  pageTransition: 0.3,
} as const;

// ─── Score Zone Colors ────────────────────────────────────
/** Returns Tailwind class based on score zone */
export function getScoreZone(score: number): {
  zone: "thriving" | "maintaining" | "attention";
  ringColor: string;
  textColor: string;
  bgColor: string;
} {
  if (score >= 80) {
    return {
      zone: "thriving",
      ringColor: "stroke-accent-green",
      textColor: "text-accent-green",
      bgColor: "bg-success-soft",
    };
  }
  if (score >= 50) {
    return {
      zone: "maintaining",
      ringColor: "stroke-accent-orange",
      textColor: "text-accent-orange",
      bgColor: "bg-warning-soft",
    };
  }
  return {
    zone: "attention",
    ringColor: "stroke-danger",
    textColor: "text-danger",
    bgColor: "bg-danger-soft",
  };
}

// ─── Delta Helpers ────────────────────────────────────────
export function formatDelta(value: number): string {
  if (value > 0) return `+${value}`;
  return `${value}`;
}

export function getDeltaColor(value: number): string {
  if (value > 0) return "text-accent-green";
  if (value < 0) return "text-danger";
  return "text-text-body-subtle";
}

// ─── Crossfade (time view transitions) ──────────────────
export const crossfade: Variants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
};

export const crossfadeTransition: Transition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// ─── Arc Draw (hero score decorative arc) ────────────────
export const arcDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.2, ease: [0.25, 0.1, 0.25, 1] },
      opacity: { duration: 0.3 },
    },
  },
};

// ─── Number Entrance (hero score) ────────────────────────
export const numberEntrance: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 28, delay: 0.1 },
  },
};

// ─── Swipe Physics ──────────────────────────────────────
export const swipeSpring: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** 3D carousel snap — fast but smooth */
export const carouselSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
};

/** Content entrance for domain pages — slide up + fade */
export const domainContentEntrance: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Stagger for domain content items */
export const domainStagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};
