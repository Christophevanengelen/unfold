"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface AnimatedNumberProps {
  /** Target value to count to */
  value: number;
  /** Duration in seconds */
  duration?: number;
  /** CSS class for the number */
  className?: string;
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Controls when animation plays — mirrors ScoreRing pattern */
  isActive?: boolean;
}

/**
 * Animated counter with smart state memory.
 * Uses native requestAnimationFrame — no Motion dependency.
 *
 * Animation behavior (same contract as ScoreRing):
 * - First activation: animate 0 → value (with delay)
 * - Revisit (already animated, same value): show value immediately
 * - Value change (day switch): animate oldValue → newValue (fast)
 * - Inactive + never animated: show static value
 */
export function AnimatedNumber({
  value,
  duration = 1.8,
  className = "",
  delay = 0,
  isActive = true,
}: AnimatedNumberProps) {
  // `null` = aucune image d animation n a encore ete peinte. C est un ETAT, il
  // est lu pendant le rendu, et il porte a lui seul la question « a-t-on deja
  // anime ? » : plus besoin d un second etat pour la meme information.
  const [display, setDisplay] = useState<number | null>(null);
  // La MEME question, mais posee depuis l effet : premiere activation, ou
  // changement de valeur ? Une ref suffit ici parce qu elle n est jamais lue
  // pendant le rendu — c est la lecture pendant le rendu qui etait fautive, pas
  // la ref elle-meme.
  const aAnimeRef = useRef(false);
  const prevValue = useRef(0);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const animateFromTo = useCallback(
    (from: number, to: number, animDelay: number, dur: number) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);

      timeoutRef.current = setTimeout(() => {
        const start = performance.now();
        const durationMs = dur * 1000;

        const step = (now: number) => {
          const elapsed = now - start;
          const t = Math.min(elapsed / durationMs, 1);
          // quintic ease-out — long deceleration for premium feel
          const eased = 1 - Math.pow(1 - t, 5);
          setDisplay(Math.round(from + eased * (to - from)));
          if (t < 1) {
            rafRef.current = requestAnimationFrame(step);
          }
        };

        rafRef.current = requestAnimationFrame(step);
      }, animDelay * 1000);
    },
    [],
  );

  useEffect(() => {
    if (!isActive) return;

    if (!aAnimeRef.current) {
      // First activation: animate 0 → value
      aAnimeRef.current = true;
      animateFromTo(0, value, delay, duration);
      prevValue.current = value;
    } else if (prevValue.current !== value) {
      // Value changed (day switch): animate old → new, faster
      animateFromTo(prevValue.current, value, 0.05, duration * 0.6);
      prevValue.current = value;
    }
    // Revisit with same value: do nothing — display is already correct
  }, [value, isActive, delay, duration, animateFromTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Une ref ne se lit pas pendant le rendu : sa valeur n est pas suivie, donc
  // React peut peindre une image qui ne correspond a rien. « A-t-on deja
  // anime ? » influence l affichage, c est donc un ETAT, pas une ref — et cet
  // etat, c est `display === null`.
  //
  // Les trois cas, inchanges :
  //   jamais anime + inactif ... on montre la valeur, sans compter ;
  //   jamais anime + actif .... on montre 0, le comptage demarre ;
  //   deja anime .............. on montre l image en cours.
  const rendered = display === null ? (isActive ? 0 : value) : display;

  return <span className={className}>{rendered}</span>;
}
