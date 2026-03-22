"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max height as CSS value (default: "85%") */
  maxHeight?: string;
}

/**
 * Shared BottomSheet primitive — backdrop + spring slide + drag handle + Escape dismiss.
 * Replaces duplicated patterns across CapsuleDetailSheet, ProfileDrawer, PremiumTeaser, etc.
 */
export function BottomSheet({ open, onClose, children, maxHeight = "85%" }: BottomSheetProps) {
  // Dismiss on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-bg-primary"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              maxHeight,
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
            }}
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-8 rounded-full" style={{ background: "var(--border-base)" }} />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-none">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
