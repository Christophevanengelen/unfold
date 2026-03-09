"use client";

import { motion, type Transition, type Variant } from "motion/react";
import { type ReactNode } from "react";

// ─── Premium easing curves ──────────────────────────────────────
// Apple-inspired ease-out — smooth, controlled, no bounce
const premiumEase: [number, number, number, number] = [0.16, 1, 0.3, 1];

// ─── Animation variants ──────────────────────────────────────────
// Small travel distances — subtle, refined reveals
const variants: Record<string, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 20, willChange: "opacity, transform" },
    visible: { opacity: 1, y: 0, willChange: "auto" },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -14, willChange: "opacity, transform" },
    visible: { opacity: 1, y: 0, willChange: "auto" },
  },
  fadeIn: {
    hidden: { opacity: 0, willChange: "opacity" },
    visible: { opacity: 1, willChange: "auto" },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95, willChange: "opacity, transform" },
    visible: { opacity: 1, scale: 1, willChange: "auto" },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -24, willChange: "opacity, transform" },
    visible: { opacity: 1, x: 0, willChange: "auto" },
  },
  slideRight: {
    hidden: { opacity: 0, x: 24, willChange: "opacity, transform" },
    visible: { opacity: 1, x: 0, willChange: "auto" },
  },
};

export type ScrollRevealVariant = keyof typeof variants;

// Smooth tween — controlled duration, premium ease-out
const defaultTransition: Transition = {
  type: "tween",
  duration: 0.7,
  ease: premiumEase,
};

// Viewport config: negative bottom margin ensures element is ~80px
// INSIDE the viewport before triggering, so user sees the full animation
const defaultViewportMargin = "0px 0px -80px 0px";

// ─── ScrollReveal — single element ──────────────────────────────

interface ScrollRevealProps {
  children: ReactNode;
  variant?: ScrollRevealVariant;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  duration?: number;
}

/**
 * Scroll-triggered reveal wrapper.
 * Uses tween transitions with Apple-style ease-out curves.
 * Elements trigger when 80px inside the viewport for full visibility.
 */
export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className = "",
  threshold = 0.1,
  once = true,
  duration,
}: ScrollRevealProps) {
  const v = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold, margin: defaultViewportMargin }}
      variants={v}
      transition={{
        ...defaultTransition,
        delay,
        ...(duration ? { duration } : {}),
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── ScrollRevealGroup — stagger container ──────────────────────

/**
 * Staggered scroll reveal for a group of items.
 * Children animate in sequence with controlled timing.
 */
export function ScrollRevealGroup({
  children,
  className = "",
  stagger = 0.12,
  threshold = 0.05,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  threshold?: number;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: threshold, margin: defaultViewportMargin }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── ScrollRevealItem — child inside a group ────────────────────

/**
 * Individual child item for use inside ScrollRevealGroup.
 */
export function ScrollRevealItem({
  children,
  className = "",
  variant = "fadeUp",
}: {
  children: ReactNode;
  className?: string;
  variant?: ScrollRevealVariant;
}) {
  const v = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      className={className}
      variants={v}
      transition={defaultTransition}
    >
      {children}
    </motion.div>
  );
}
