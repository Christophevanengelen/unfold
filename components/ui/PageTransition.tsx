"use client";

import { motion } from "motion/react";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Smooth page entrance animation.
 * Wrap any page content for a subtle fade + slide-up on mount.
 */
export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad
      }}
    >
      {children}
    </motion.div>
  );
}
