import { useCallback, useRef } from "react";

/**
 * useLongPress — fires `onLongPress` after `delayMs` of sustained press.
 * Cancels if the user lifts, moves >8px, or the element loses focus.
 * Does NOT fire `onClick` when a long-press fires (caller handles `onClick` separately).
 *
 * Returns handlers to spread on an element. Works for both mouse and touch.
 *
 * Usage:
 *   const longPress = useLongPress(() => openSheet(), { delayMs: 400 });
 *   <div {...longPress}>...</div>
 */
export interface UseLongPressOptions {
  delayMs?: number;
  moveThresholdPx?: number;
}

export function useLongPress(
  onLongPress: () => void,
  { delayMs = 400, moveThresholdPx = 8 }: UseLongPressOptions = {},
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startPos = useRef<{ x: number; y: number } | null>(null);
  const firedRef = useRef(false);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    startPos.current = null;
  }, []);

  const start = useCallback(
    (x: number, y: number) => {
      clear();
      firedRef.current = false;
      startPos.current = { x, y };
      timer.current = setTimeout(() => {
        firedRef.current = true;
        onLongPress();
      }, delayMs);
    },
    [clear, delayMs, onLongPress],
  );

  const move = useCallback(
    (x: number, y: number) => {
      if (!startPos.current) return;
      const dx = Math.abs(x - startPos.current.x);
      const dy = Math.abs(y - startPos.current.y);
      if (dx > moveThresholdPx || dy > moveThresholdPx) clear();
    },
    [clear, moveThresholdPx],
  );

  return {
    onMouseDown: (e: React.MouseEvent) => start(e.clientX, e.clientY),
    onMouseMove: (e: React.MouseEvent) => move(e.clientX, e.clientY),
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) start(t.clientX, t.clientY);
    },
    onTouchMove: (e: React.TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    },
    onTouchEnd: clear,
    onTouchCancel: clear,
    /** If true, a long-press was fired during this interaction — suppress click. */
    didLongPress: () => firedRef.current,
  };
}
