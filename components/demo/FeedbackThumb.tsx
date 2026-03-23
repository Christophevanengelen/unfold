"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown } from "flowbite-react-icons/outline";
import { springs } from "@/lib/animations";

// ─── Props ───────────────────────────────────────────────
interface FeedbackThumbProps {
  capsuleId: string;
  onFeedback?: (positive: boolean) => void;
}

// ─── localStorage key ────────────────────────────────────
function storageKey(capsuleId: string) {
  return `feedback_${capsuleId}`;
}

// ─── Component ───────────────────────────────────────────

/**
 * Inline feedback thumbs — up/down.
 * Subtle, muted by default. Persists choice in localStorage.
 * Placed at the bottom of CapsuleDetailSheet.
 */
export function FeedbackThumb({ capsuleId, onFeedback }: FeedbackThumbProps) {
  const [choice, setChoice] = useState<"up" | "down" | null>(null);

  // Load persisted choice on mount / capsuleId change
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey(capsuleId));
      if (stored === "up" || stored === "down") {
        setChoice(stored);
      } else {
        setChoice(null);
      }
    } catch {
      // localStorage unavailable — silent fail
    }
  }, [capsuleId]);

  const handleTap = useCallback(
    (value: "up" | "down") => {
      // Toggle off if already selected, otherwise set
      const next = choice === value ? null : value;
      setChoice(next);
      try {
        if (next) {
          localStorage.setItem(storageKey(capsuleId), next);
        } else {
          localStorage.removeItem(storageKey(capsuleId));
        }
      } catch {
        // silent
      }
      if (next && onFeedback) {
        onFeedback(next === "up");
      }
    },
    [capsuleId, choice, onFeedback],
  );

  return (
    <div className="flex items-center gap-3">
      <ThumbButton
        direction="up"
        active={choice === "up"}
        dimmed={choice === "down"}
        onTap={() => handleTap("up")}
      />
      <ThumbButton
        direction="down"
        active={choice === "down"}
        dimmed={choice === "up"}
        onTap={() => handleTap("down")}
      />
    </div>
  );
}

// ─── Individual Thumb Button ─────────────────────────────

function ThumbButton({
  direction,
  active,
  dimmed,
  onTap,
}: {
  direction: "up" | "down";
  active: boolean;
  dimmed: boolean;
  onTap: () => void;
}) {
  const opacity = active ? 1 : dimmed ? 0.15 : 0.3;
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 1.25 }}
      transition={springs.bouncy}
      className="flex items-center justify-center rounded-lg p-1.5 transition-opacity"
      style={{ opacity }}
      aria-label={direction === "up" ? "Helpful" : "Not helpful"}
    >
      <Icon
        size={16}
        style={{
          color: active ? "var(--accent-purple)" : "var(--text-body-subtle)",
        }}
      />
    </motion.button>
  );
}
