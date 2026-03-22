"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Share2 } from "lucide-react";
import { getConnections, getMyInviteCode, type RealConnection } from "@/lib/connections-store";

const relationshipColors: Record<string, string> = {
  partner: "#D89EA0",
  friend: "#50C4D6",
  family: "#6BA89A",
  colleague: "#9585CC",
};

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<RealConnection[]>([]);
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [myCode, setMyCode] = useState("...");

  // Load real connections from localStorage
  useEffect(() => {
    setConnections(getConnections());
    setMyCode(getMyInviteCode());
  }, []);

  const handleCodeSubmit = () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;

    // For code-only entry (no invite link), we can't resolve birth data.
    // Show a message that they need the full invite link.
    // For now, redirect to connected page — it will handle missing data gracefully.
    router.push(`/demo/invite/connected?name=${encodeURIComponent(trimmed.slice(-4))}&code=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-1 flex items-center justify-between">
        <div>
          <h1 className="font-display text-lg font-bold text-text-heading">Connexions</h1>
          <p className="text-xs text-text-body-subtle">
            {connections.length > 0
              ? `${connections.length} connecté${connections.length !== 1 ? "s" : ""}`
              : "Invitez quelqu'un pour commencer"
            }
          </p>
        </div>
      </div>

      {/* Connected people — real connections only */}
      {connections.length > 0 && (
        <div className="mt-4 space-y-2">
          {connections.map((connection) => {
            const relColor = relationshipColors[connection.relationship] ?? "#9585CC";
            return (
              <Link
                key={connection.id}
                href={`/demo/compatibility/${connection.id}`}
                className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
                style={{ background: "var(--bg-secondary)" }}
              >
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold text-white"
                  style={{ backgroundColor: relColor }}
                >
                  {connection.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-text-heading">
                    {connection.name}
                  </span>
                  <p className="text-[10px] text-text-body-subtle capitalize">
                    {connection.relationship === "partner" ? "Partenaire" :
                     connection.relationship === "friend" ? "Ami·e" :
                     connection.relationship === "family" ? "Famille" : "Collègue"}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="1.5" className="text-text-body-subtle flex-shrink-0">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </Link>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {connections.length === 0 && (
        <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center"
          style={{ background: "var(--surface-subtle)" }}>
          <div className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}>
            <Share2 size={20} style={{ color: "var(--accent-purple)" }} />
          </div>
          <p className="text-sm text-text-body">
            Partagez votre code ou entrez celui d&apos;un proche pour comparer vos rythmes.
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="my-5 h-px" style={{ background: "var(--surface-medium)" }} />

      {/* Two CTAs: Share your code + Enter a code */}
      <div className="space-y-3">
        <Link
          href="/demo/invite/share"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
          style={{ background: "var(--surface-light)", border: "1px solid var(--border-tint-light)" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--border-tint-light)" }}>
            <Share2 size={16} strokeWidth={1.5} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-heading">Partager votre code</p>
            <p className="text-[11px] text-text-body-subtle">Invitez quelqu&apos;un à comparer vos rythmes</p>
          </div>
          <span className="text-xs font-mono font-semibold tracking-wider" style={{ color: "var(--accent-purple)" }}>
            {myCode}
          </span>
        </Link>

        {!showCodeInput ? (
          <button
            onClick={() => setShowCodeInput(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{ border: "1px solid var(--border-tint-medium)", color: "var(--accent-purple)" }}
          >
            Entrer un code reçu
          </button>
        ) : (
          <motion.div
            className="rounded-2xl p-4"
            style={{ background: "var(--surface-light)", border: "1px solid var(--border-tint-light)" }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle mb-2">
              Entrez leur code
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
                Connecter
              </button>
            </div>
            <p className="mt-2 text-[10px] text-text-body-subtle">
              Demandez le lien d&apos;invitation complet pour une connexion automatique.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
