"use client";

import { motion, type Transition, type Variant } from "motion/react";
import { type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  /** Animation variant — default is fadeUp */
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";
  /** Delay before animation starts */
  delay?: number;
  /** Additional CSS class */
  className?: string;
  /** How much of the element must be visible (0-1) */
  threshold?: number;
  /** Whether to animate only once */
  once?: boolean;
}

const variants: Record<string, { hidden: Variant; visible: Variant }> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 40 },
    visible: { opacity: 1, x: 0 },
  },
};

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 30,
  mass: 1,
};

/**
 * Scroll-triggered reveal animation wrapper.
 * Uses Motion's whileInView to animate children when they enter the viewport.
 */
export function ScrollReveal({
  children,
  variant = "fadeUp",
  delay = 0,
  className = "",
  threshold = 0.15,
  once = true,
}: ScrollRevealProps) {
  const v = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
      variants={v}
      transition={{ ...defaultTransition, delay }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Staggered scroll reveal for a group of items.
 * Wrap around children that should animate in sequence.
 */
export function ScrollRevealGroup({
  children,
  className = "",
  stagger = 0.12,
  threshold = 0.1,
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
      viewport={{ once: true, amount: threshold }}
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
  variant?: "fadeUp" | "fadeIn" | "scaleIn" | "slideLeft" | "slideRight";
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
