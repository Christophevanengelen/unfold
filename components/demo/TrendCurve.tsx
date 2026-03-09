"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TrendCurveProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  /** Controls when animation plays — mirrors ScoreRing pattern */
  isActive?: boolean;
}

/**
 * Edge-to-edge smooth trend curve with animated draw-on effect.
 * Zero padding — curve spans full card width, clipped by card's overflow-hidden.
 * Uses Catmull-Rom spline interpolation for smooth, no-overshoot curves.
 *
 * Animation behavior (same contract as ScoreRing):
 * - First activation: draw line left→right (1.6s quintic), then fade in fill
 * - Revisit (already animated, same data): show completed curve immediately
 * - Data change (day switch): re-draw animation
 * - Inactive + never animated: show completed curve (peek cards look correct)
 */
export function TrendCurve({
  data,
  color,
  width = 343,
  height = 160,
  isActive = true,
}: TrendCurveProps) {
  const pathRef = useRef<SVGPathElement>(null);
  const hasAnimated = useRef(false);
  const prevDataKey = useRef("");
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // drawProgress: 0 (hidden) → 1 (fully drawn)
  const [drawProgress, setDrawProgress] = useState(0);
  const [pathLength, setPathLength] = useState(0);

  // Data fingerprint for detecting day switches
  const dataKey = data.join(",");

  // Measure path length after render / data change
  useEffect(() => {
    const path = pathRef.current;
    if (path && data.length >= 2) {
      setPathLength(path.getTotalLength());
    }
  }, [dataKey, data.length]);

  const animateDraw = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    cancelAnimationFrame(rafRef.current);

    setDrawProgress(0);

    timeoutRef.current = setTimeout(() => {
      const start = performance.now();
      const drawDuration = 1600;

      const step = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / drawDuration, 1);
        // quintic ease-out — smooth deceleration
        const eased = 1 - Math.pow(1 - t, 5);
        setDrawProgress(eased);

        if (t < 1) {
          rafRef.current = requestAnimationFrame(step);
        }
      };

      rafRef.current = requestAnimationFrame(step);
    }, 200);
  }, []);

  // Animation trigger — mirrors ScoreRing pattern
  useEffect(() => {
    if (!isActive) return;

    if (!hasAnimated.current) {
      // First activation: draw animation
      hasAnimated.current = true;
      prevDataKey.current = dataKey;
      animateDraw();
    } else if (prevDataKey.current !== dataKey) {
      // Data changed (day switch): re-draw
      prevDataKey.current = dataKey;
      animateDraw();
    }
    // Revisit same data: drawProgress & fillOpacity already at final state
  }, [isActive, dataKey, animateDraw]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Early return AFTER all hooks
  if (data.length < 2) return null;

  const padY = 16;
  const chartHeight = height - padY * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: padY + chartHeight - ((value - min) / range) * chartHeight,
  }));

  const smoothPath = buildSmoothPath(points);
  const fillPath = `${smoothPath} L ${width} ${height} L 0 ${height} Z`;
  const gradientId = `trend-fill-${color.replace(/[^a-zA-Z0-9]/g, "")}`;

  // Inactive cards that haven't animated: hide curve (animates on first activation)
  const effectiveProgress = !hasAnimated.current && !isActive ? 0 : drawProgress;
  // Gradient fill follows the line — starts at 25% draw, reaches full at 100%
  const effectiveFill = Math.max(0, (effectiveProgress - 0.25) / 0.75);
  const dashOffset = pathLength > 0 ? pathLength * (1 - effectiveProgress) : 0;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="block"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>

      {/* Gradient fill — fades in after line draws */}
      <path
        d={fillPath}
        fill={`url(#${gradientId})`}
        style={{ opacity: effectiveFill }}
      />

      {/* Smooth curve line — animated draw */}
      <path
        ref={pathRef}
        d={smoothPath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength > 0 ? pathLength : undefined}
        strokeDashoffset={pathLength > 0 ? dashOffset : undefined}
        style={{ opacity: effectiveProgress > 0 ? 1 : 0 }}
      />
    </svg>
  );
}

/**
 * Build a silky smooth SVG path using Catmull-Rom spline interpolation.
 * Tension 0 = maximum smoothness (round curves), 1 = straight lines.
 * Default 0.12 gives gentle, flowing curves that feel natural.
 */
function buildSmoothPath(
  points: { x: number; y: number }[],
  tension = 0.12,
): string {
  const n = points.length;
  if (n < 2) return "";
  if (n === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  const alpha = (1 - tension) / 6;

  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;

  for (let i = 0; i < n - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(n - 1, i + 2)];

    const cp1x = p1.x + alpha * (p2.x - p0.x);
    const cp1y = p1.y + alpha * (p2.y - p0.y);

    const cp2x = p2.x - alpha * (p3.x - p1.x);
    const cp2y = p2.y - alpha * (p3.y - p1.y);

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  return path;
}
