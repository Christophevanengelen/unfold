"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "motion/react";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { ConnectionReport } from "./ConnectionReport";

interface ConnectionCarouselProps {
  connections: RealConnection[];
  currentIndex: number;
  myBirthData: BirthData | null;
  onIndexChange: (newIndex: number) => void;
}

/**
 * Horizontal swipe pager between connection reports.
 * - Drag threshold 60px → advance to prev/next connection in list order.
 * - Only the active slide is mounted (cheap: saves 3-N fetch chains running in background).
 * - Adjacent slides render a tier-ghost preview during drag for affordance.
 *
 * URL is updated via onIndexChange (caller controls routing with `router.replace`).
 */
export function ConnectionCarousel({
  connections,
  currentIndex,
  myBirthData,
  onIndexChange,
}: ConnectionCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [width, setWidth] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Observe container width so drag/animation can use pixels
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) setWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const current = connections[currentIndex];
  const DRAG_THRESHOLD = 60;
  const canLeft = currentIndex > 0;
  const canRight = currentIndex < connections.length - 1;

  // Light opacity hint as user drags into blocked edges
  const opacity = useTransform(x, [-DRAG_THRESHOLD * 2, 0, DRAG_THRESHOLD * 2], [0.6, 1, 0.6]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const { offset, velocity } = info;
    const swipePower = Math.abs(offset.x * velocity.x);
    const past = Math.abs(offset.x) > DRAG_THRESHOLD || swipePower > 10_000;
    if (!past) {
      x.set(0);
      return;
    }
    if (offset.x < 0 && canRight) {
      setDirection(1);
      onIndexChange(currentIndex + 1);
    } else if (offset.x > 0 && canLeft) {
      setDirection(-1);
      onIndexChange(currentIndex - 1);
    }
    x.set(0);
  };

  return (
    <div ref={containerRef} className="relative flex-1 overflow-hidden">
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div
          key={current?.id ?? "empty"}
          custom={direction}
          variants={{
            enter: (d: 1 | -1) => ({ x: d * width, opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit: (d: 1 | -1) => ({ x: -d * width, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
          style={{ x, opacity }}
          drag="x"
          dragConstraints={{ left: canRight ? -width : 0, right: canLeft ? width : 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
          className="h-full"
        >
          {current ? (
            <ConnectionReport
              connection={current}
              myBirthData={myBirthData}
              embedded
            />
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Edge indicators — appear briefly on touch start */}
      <EdgeHints canLeft={canLeft} canRight={canRight} x={x} width={width} />
    </div>
  );
}

function EdgeHints({
  canLeft,
  canRight,
  x,
  width,
}: {
  canLeft: boolean;
  canRight: boolean;
  x: ReturnType<typeof useMotionValue<number>>;
  width: number;
}) {
  // Show subtle side fades when a drag is in progress
  const leftOpacity = useTransform(x, [0, Math.max(width * 0.2, 1)], [0, 0.35]);
  const rightOpacity = useTransform(x, [Math.min(-width * 0.2, -1), 0], [0.35, 0]);

  return (
    <>
      {canLeft && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 left-0 w-8"
          style={{
            background: "linear-gradient(to right, var(--accent-purple), transparent)",
            opacity: leftOpacity,
          }}
          aria-hidden
        />
      )}
      {canRight && (
        <motion.div
          className="pointer-events-none absolute inset-y-0 right-0 w-8"
          style={{
            background: "linear-gradient(to left, var(--accent-purple), transparent)",
            opacity: rightOpacity,
          }}
          aria-hidden
        />
      )}
    </>
  );
}
