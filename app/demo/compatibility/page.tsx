"use client";

import { useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { mockConnections, mockUser } from "@/lib/mock-data";
import { fadeInUp, staggerContainer } from "@/lib/animations";

const avatarColors: Record<string, string> = {
  J: "#D89EA0",
  S: "#50C4D6",
  M: "#9585CC",
};

export default function ConnectionsPage() {
  const router = useRouter();
  const connected = mockConnections.filter((c) => c.status === "connected");
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);

  const handleCodeSubmit = () => {
    if (code.trim().length >= 4) {
      // In production: validate code via API → returns partner name
      // Demo: simulate with "Jordan" as partner name
      router.push("/demo/invite/connected?name=Jordan");
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="mb-1 flex items-center justify-between" variants={fadeInUp}>
        <div>
          <h1 className="font-display text-lg font-bold text-text-heading">Connections</h1>
          <p className="text-xs text-text-body-subtle">{connected.length} connected</p>
        </div>
      </motion.div>

      {/* Connected people */}
      <motion.div className="mt-4 space-y-2" variants={staggerContainer}>
        {connected.map((connection) => {
          const relColor = avatarColors[connection.initial] ?? "#9585CC";
          return (
            <motion.div key={connection.id} variants={fadeInUp}>
              <Link
                href={`/demo/compatibility/${connection.id}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
                style={{ background: "var(--bg-secondary)" }}
              >
                {/* Avatar */}
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                  style={{ backgroundColor: relColor }}
                >
                  {connection.initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-text-heading">
                    {connection.name}
                  </span>
                </div>

                {/* Arrow */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" className="text-text-body-subtle flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Divider */}
      <div className="my-5 h-px" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }} />

      {/* Two CTAs: Share your code + Enter a code */}
      <motion.div className="space-y-3" variants={fadeInUp}>
        {/* Share your code */}
        <Link
          href="/demo/invite/share"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
          style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}>
            <Share2 size={16} strokeWidth={1.5} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-heading">Share your code</p>
            <p className="text-[11px] text-text-body-subtle">Invite someone to compare timelines</p>
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider" style={{ color: "var(--accent-purple)" }}>
            {mockUser.inviteCode}
          </span>
        </Link>

        {/* Enter a code */}
        {!showCodeInput ? (
          <button
            onClick={() => setShowCodeInput(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{ border: "1px solid color-mix(in srgb, var(--accent-purple) 20%, transparent)", color: "var(--accent-purple)" }}
          >
            Enter a received code
          </button>
        ) : (
          <motion.div
            className="rounded-2xl p-4"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)", border: "1px solid color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
              Enter their code
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="UNFOLD-XXXX"
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-mono tracking-wider text-white placeholder:text-white/20 focus:border-accent-purple/40 focus:outline-none"
                maxLength={12}
              />
              <button
                onClick={handleCodeSubmit}
                disabled={code.trim().length < 4}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-30"
                style={{ background: "var(--accent-purple)" }}
              >
                Connect
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
