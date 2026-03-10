"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TrendCurveProps {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  /** Total SVG height — fill extends to this. Defaults to height. */
  fillHeight?: number;
  /** Controls when animation plays — mirrors ScoreRing pattern */
  isActive?: boolean;
  /** Active day index in the 7-day week (2=yesterday, 3=today, 4=tomorrow).
   *  Dots: hide day 0 & 6, subtle for day 1 & 5, glow on active day. */
  activeDayIndex?: number;
}

/**
 * Edge-to-edge smooth trend curve with animated draw-on effect and edge fade.
 * Organic flowing shape with gradient stroke and glowing dots at inflection points.
 * Uses Catmull-Rom spline interpolation for smooth, natural curves.
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
  fillHeight,
  isActive = true,
  activeDayIndex,
}: TrendCurveProps) {
  const totalHeight = fillHeight ?? height;
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
      hasAnimated.current = true;
      prevDataKey.current = dataKey;
      animateDraw();
    } else if (prevDataKey.current !== dataKey) {
      prevDataKey.current = dataKey;
      animateDraw();
    }
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

  const padY = 12;
  const chartHeight = height - padY * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, i) => ({
    x: (i / (data.length - 1)) * width,
    y: padY + chartHeight - ((value - min) / range) * chartHeight,
  }));

  const smoothPath = buildSmoothPath(points);
  const colorSafe = color.replace(/[^a-zA-Z0-9]/g, "");
  const glowFilterId = `trend-glow-${colorSafe}`;

  // Inactive cards that haven't animated: hide curve
  const effectiveProgress = !hasAnimated.current && !isActive ? 0 : drawProgress;
  const effectiveFill = Math.max(0, (effectiveProgress - 0.25) / 0.75);
  const dashOffset = pathLength > 0 ? pathLength * (1 - effectiveProgress) : 0;

  return (
    <svg
      width={width}
      height={totalHeight}
      viewBox={`0 0 ${width} ${totalHeight}`}
      className="block"
    >
      <defs>
        {/* Gradient fill under the curve */}
        <linearGradient id={`${colorSafe}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.04} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
        {/* Horizontal edge fade — progressive transparency at left & right */}
        <linearGradient id={`${colorSafe}-edge-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="white" stopOpacity={0} />
          <stop offset="30%" stopColor="white" stopOpacity={1} />
          <stop offset="70%" stopColor="white" stopOpacity={1} />
          <stop offset="100%" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask id={`${colorSafe}-edge-mask`}>
          <rect width={width} height={totalHeight} fill={`url(#${colorSafe}-edge-fade)`} />
        </mask>
        {/* Glow filter for active dot */}
        <filter id={glowFilterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* Edge fade group — progressive transparency at card edges */}
      <g mask={`url(#${colorSafe}-edge-mask)`}>
        {/* Gradient fill under curve — fades in after line draws */}
      {smoothPath && (
        <path
          d={`${smoothPath} L ${points[points.length - 1].x} ${totalHeight} L ${points[0].x} ${totalHeight} Z`}
          fill={`url(#${colorSafe}-fill)`}
          style={{ opacity: effectiveFill }}
        />
      )}

      {/* Smooth curve line — solid color stroke, animated draw */}
      <path
        ref={pathRef}
        d={smoothPath}
        fill="none"
        stroke={color}
        strokeOpacity={0.5}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={pathLength > 0 ? pathLength : undefined}
        strokeDashoffset={pathLength > 0 ? dashOffset : undefined}
        style={{ opacity: effectiveProgress > 0 ? 1 : 0 }}
      />

      {/* Week dots — 7 days, hide first & last, glow on active day */}
      {points.map((pt, i) => {
        // Hide day 0 and day 6 (first & last of week)
        if (i === 0 || i === 6) return null;

        const isActiveDot = activeDayIndex !== undefined && i === activeDayIndex;
        const isEdge = i === 1 || i === 5;

        if (isActiveDot) {
          // Glowing active day dot — prominent
          return (
            <g key={`dot-${i}`} style={{ opacity: effectiveFill }}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={8}
                fill={color}
                opacity={0.25}
                filter={`url(#${glowFilterId})`}
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={4}
                fill="white"
                opacity={0.95}
              />
            </g>
          );
        }

        // Visible dots for other days
        return (
          <circle
            key={`dot-${i}`}
            cx={pt.x}
            cy={pt.y}
            r={3}
            fill={color}
            opacity={effectiveFill * (isEdge ? 0.35 : 0.55)}
          />
        );
      })}

      </g>
    </svg>
  );
}

/**
 * Build a smooth SVG path using Catmull-Rom spline interpolation.
 * Tension 0 = maximum smoothness (round curves), 1 = straight lines.
 * 0.15 gives organic, flowing curves matching the design reference.
 */
function buildSmoothPath(
  points: { x: number; y: number }[],
  tension = 0.05,
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
