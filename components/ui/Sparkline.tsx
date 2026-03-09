"use client";

import { motion } from "motion/react";

interface SparklineProps {
  /** Array of numeric values to plot */
  data: number[];
  /** Width of the sparkline */
  width?: number;
  /** Height of the sparkline */
  height?: number;
  /** Stroke color (CSS var or hex) */
  color?: string;
  /** Show filled area under line */
  fill?: boolean;
  /** Delay before draw animation */
  delay?: number;
  /** Additional CSS class */
  className?: string;
}

/**
 * Animated 7-day mini line chart.
 * Draws the path on mount with spring physics.
 */
export function Sparkline({
  data,
  width = 100,
  height = 32,
  color = "var(--accent-purple)",
  fill = false,
  delay = 0,
  className = "",
}: SparklineProps) {
  if (data.length < 2) return null;

  const padding = 2;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Build SVG path
  const points = data.map((value, i) => {
    const x = padding + (i / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((value - min) / range) * chartHeight;
    return { x, y };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const fillPath = fill
    ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${height - padding} L ${padding} ${height - padding} Z`
    : "";

  // Dot for the last (current) value
  const lastPoint = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {/* Filled area */}
      {fill && (
        <motion.path
          d={fillPath}
          fill={color}
          fillOpacity={0.1}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 1.2, duration: 0.6, ease: "easeOut" }}
        />
      )}

      {/* Line */}
      <motion.path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { delay, duration: 1.6, ease: [0.22, 1, 0.36, 1] },
          opacity: { delay, duration: 0.3 },
        }}
      />

      {/* Current value dot */}
      <motion.circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={2.5}
        fill={color}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: delay + 1.4, duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  );
}
