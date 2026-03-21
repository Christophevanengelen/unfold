"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { mockConnections } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";

const relationshipLabels: Record<string, string> = {
  partner: "Partner",
  friend: "Friend",
  family: "Family",
  colleague: "Colleague",
};

const relationshipColors: Record<string, string> = {
  partner: "var(--accent-pink)",
  friend: "var(--accent-blue)",
  family: "var(--accent-green)",
  colleague: "var(--accent-orange)",
};

function AlignmentDot({ value }: { value: number }) {
  const color =
    value >= 80
      ? "var(--accent-green)"
      : value >= 60
        ? "var(--accent-orange)"
        : "var(--text-body-subtle)";
  return (
    <motion.span
      className="relative flex h-2.5 w-2.5"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      {value >= 80 && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-30"
          style={{ backgroundColor: color }}
        />
      )}
      <span
        className="relative inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
    </motion.span>
  );
}

export default function ConnectionsPage() {
  const connected = mockConnections.filter((c) => c.status === "connected");
  const pending = mockConnections.filter((c) => c.status !== "connected");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-1 flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="font-display text-lg font-bold text-text-heading">
            Connections
          </h1>
          <p className="text-xs text-text-body-subtle">
            {connected.length} connected
          </p>
        </div>
        <Link
          href="/demo/invite"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors"
          style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
          aria-label="Add connection"
        >
          <UserPlus size={16} strokeWidth={1.5} style={{ color: "var(--accent-purple)" }} />
        </Link>
      </motion.div>

      {/* Today's alignment summary */}
      <motion.div
        className="mt-4 rounded-2xl px-4 py-3"
        style={{
          background: "linear-gradient(135deg, color-mix(in srgb, var(--accent-pink) 8%, var(--bg-secondary)), var(--bg-secondary))",
        }}
        variants={fadeInUp}
      >
        <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">
          Today&apos;s alignment
        </p>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-display text-2xl font-bold text-text-heading">
            <AnimatedNumber
              value={Math.round(connected.reduce((sum, c) => sum + c.todayAlignment, 0) / connected.length)}
              duration={0.6}
            />
          </span>
          <span className="text-xs text-text-body-subtle">avg across {connected.length} connections</span>
        </div>
      </motion.div>

      {/* Connected people */}
      <motion.div className="mt-5 space-y-2" variants={staggerContainer}>
        {connected.map((connection) => (
          <motion.div key={connection.id} variants={fadeInUp}>
            <Link
              href={`/demo/compatibility/${connection.id}`}
              className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
              style={{ background: "var(--bg-secondary)" }}
            >
              {/* Avatar */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                style={{ backgroundColor: relationshipColors[connection.relationship] }}
              >
                {connection.initial}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-text-heading">
                    {connection.name}
                  </span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                    style={{
                      background: `color-mix(in srgb, ${relationshipColors[connection.relationship]} 12%, transparent)`,
                      color: relationshipColors[connection.relationship],
                    }}
                  >
                    {relationshipLabels[connection.relationship]}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-text-body-subtle">
                  {connection.todayInsight}
                </p>
              </div>

              {/* Alignment + score */}
              <div className="flex shrink-0 items-center gap-2">
                <AlignmentDot value={connection.todayAlignment} />
                <span className="font-display text-lg font-bold text-text-heading">
                  {connection.score}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Pending invites */}
      {pending.length > 0 && (
        <motion.div className="mt-6" variants={fadeInUp}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">
            Pending
          </p>
          {pending.map((connection) => (
            <div
              key={connection.id}
              className="flex items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3"
              style={{ borderColor: "var(--border-base)" }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold"
                style={{
                  backgroundColor: "var(--bg-tertiary)",
                  color: "var(--text-body-subtle)",
                }}
              >
                {connection.initial}
              </div>
              <div className="flex-1">
                <span className="text-[13px] font-semibold text-text-heading">
                  {connection.name}
                </span>
                <p className="text-[11px] text-text-body-subtle">
                  Waiting for them to join
                </p>
              </div>
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: "var(--accent-orange)" }}
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          ))}
        </motion.div>
      )}

      {/* Add connection CTA */}
      <motion.div className="mt-6" variants={fadeInUp}>
        <Link
          href="/demo/invite"
          className="flex w-full items-center justify-center gap-2 rounded-2xl border py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            borderColor: "var(--accent-purple)",
            color: "var(--accent-purple)",
          }}
        >
          <UserPlus size={16} strokeWidth={1.5} />
          Add a connection
        </Link>
      </motion.div>
    </motion.div>
  );
}
