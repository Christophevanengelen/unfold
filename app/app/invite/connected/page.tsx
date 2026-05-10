"use client";

import { useState, useEffect, Suspense } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  addConnection,
  updateRelationship,
  parseInviteParams,
  type RelationshipType,
} from "@/lib/connections-store";
import { relationshipConfig, relationshipOrder } from "@/components/demo/compat/relationshipConfig";

const CONFETTI_COLORS = [
  "#B07CC2", "#D89EA0", "#6BA89A", "#9585CC", "#50C4D6", "#C4A86B",
];

const PARTICLES = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2;
  const dist = 60 + (i % 3) * 30;
  return {
    x: Math.cos(angle) * dist,
    y: Math.sin(angle) * dist,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 3 + (i % 3),
    delay: i * 0.03,
  };
});

function ConnectedContent() {
  const searchParams = useSearchParams();
  const partnerName = searchParams.get("name") ?? "quelqu'un";
  const [selectedRelation, setSelectedRelation] = useState<RelationshipType | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);

  // On mount, parse invite params and create connection
  useEffect(() => {
    const parsed = parseInviteParams(searchParams);
    if (parsed) {
      const conn = addConnection({
        name: parsed.name,
        relationship: "friend", // default, updated when user picks
        birthData: parsed.birthData,
        inviteCode: parsed.code,
      });
      setConnectionId(conn.id);
    }
  }, [searchParams]);

  // Update relationship when user picks one
  useEffect(() => {
    if (connectionId && selectedRelation) {
      updateRelationship(connectionId, selectedRelation);
    }
  }, [connectionId, selectedRelation]);

  return (
    <div className="flex h-full flex-col items-center justify-center text-center px-6">
      {/* Confetti burst */}
      <div className="relative mb-6">
        {PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              left: "50%",
              top: "50%",
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
            transition={{ delay: 0.3 + p.delay, duration: 0.8, ease: "easeOut" }}
          />
        ))}

        {/* Success check */}
        <motion.div
          className="relative flex h-16 w-16 items-center justify-center rounded-full"
          style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)" }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <motion.path
              d="M20 6L9 17l-5-5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            />
          </svg>
        </motion.div>
      </div>

      {/* Title */}
      <motion.h1
        className="font-display text-xl font-bold text-text-heading"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        Connecté avec {partnerName}
      </motion.h1>

      <motion.p
        className="mt-2 max-w-[260px] text-sm text-text-body-subtle leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Vos timelines sont liées. Dites-nous quel type de relation c&apos;est pour personnaliser vos insights.
      </motion.p>

      {/* Relationship selector */}
      <motion.div
        className="mt-6 w-full max-w-[280px] grid grid-cols-2 gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        {relationshipOrder.map((key) => {
          const rel = relationshipConfig[key];
          const isSelected = selectedRelation === rel.key;
          const Icon = rel.Icon;
          return (
            <button
              key={rel.key}
              onClick={() => setSelectedRelation(rel.key)}
              className="flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] font-medium transition-all active:scale-95"
              style={{
                background: isSelected
                  ? `color-mix(in srgb, ${rel.color} 20%, transparent)`
                  : "var(--surface-light)",
                border: `1.5px solid ${isSelected ? rel.color : "transparent"}`,
                color: isSelected ? rel.color : "var(--text-body)",
              }}
            >
              <Icon width={14} height={14} style={{ color: rel.color }} />
              {rel.labelFR}
            </button>
          );
        })}
      </motion.div>

      {/* CTA */}
      <motion.div
        className="mt-6 w-full max-w-[240px]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <Link
          href={connectionId ? `/demo/compatibility/${connectionId}` : "/demo/compatibility"}
          className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold shadow-lg transition-all active:scale-95"
          style={{
            background: selectedRelation ? "var(--bg-brand)" : "var(--surface-medium)",
            color: selectedRelation ? "var(--text-on-brand)" : "var(--text-body-subtle)",
            pointerEvents: selectedRelation ? "auto" : "none",
            opacity: selectedRelation ? 1 : 0.5,
          }}
        >
          Voir vos fenêtres de timing
        </Link>
      </motion.div>

      <motion.div
        className="mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <Link href="/demo/compatibility" className="text-xs text-text-body-subtle">
          Retour aux connexions
        </Link>
      </motion.div>
    </div>
  );
}

export default function ConnectedPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><p className="text-sm text-text-body-subtle">Chargement...</p></div>}>
      <ConnectedContent />
    </Suspense>
  );
}
