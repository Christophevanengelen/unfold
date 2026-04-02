"use client";

import { useState, useEffect, useRef } from "react";

interface TypewriterTextProps {
  text: string;
  /** Characters per second (default: 40) */
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Called when typing finishes */
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  speed = 40,
  className,
  style,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const textRef = useRef(text);

  useEffect(() => {
    // Reset on new text
    textRef.current = text;
    setDisplayed("");
    setDone(false);
    startRef.current = performance.now();

    const interval = 1000 / speed;

    function tick(now: number) {
      const elapsed = now - startRef.current;
      const chars = Math.min(Math.floor(elapsed / interval) + 1, textRef.current.length);
      setDisplayed(textRef.current.slice(0, chars));

      if (chars >= textRef.current.length) {
        setDone(true);
        onComplete?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [text, speed, onComplete]);

  return (
    <span className={className} style={style}>
      {displayed}
      {!done && (
        <span
          className="inline-block w-[2px] h-[1em] ml-0.5 align-text-bottom animate-pulse"
          style={{ background: "var(--accent-purple)", opacity: 0.6 }}
        />
      )}
    </span>
  );
}
