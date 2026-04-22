"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShareNodes } from "flowbite-react-icons/outline";
import {
  getConnections,
  getMyInviteCode,
  type RealConnection,
} from "@/lib/connections-store";
import { getBirthDataSync, type BirthData } from "@/lib/birth-data";
import { ConnectionList } from "@/components/demo/compat/ConnectionList";

const LONG_PRESS_HINT_KEY = "unfold_longpress_hint_seen_v1";

export default function ConnectionsPage() {
  const router = useRouter();
  const [connections, setConnections] = useState<RealConnection[]>([]);
  const [myBirthData, setMyBirthData] = useState<BirthData | null>(null);
  const [code, setCode] = useState("");
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [myCode, setMyCode] = useState("...");
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const list = getConnections();
    setConnections(list);
    setMyCode(getMyInviteCode());
    setMyBirthData(getBirthDataSync());
    if (list.length > 0 && typeof window !== "undefined") {
      const seen = localStorage.getItem(LONG_PRESS_HINT_KEY);
      if (!seen) setShowHint(true);
    }
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try { localStorage.setItem(LONG_PRESS_HINT_KEY, "1"); } catch {}
  };

  const handleCodeSubmit = () => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    router.push(
      `/demo/invite/connected?name=${encodeURIComponent(trimmed.slice(-4))}&code=${encodeURIComponent(trimmed)}`,
    );
  };

  const handleDeleted = (id: string) => {
    setConnections((cs) => cs.filter((c) => c.id !== id));
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-1 text-center">
        <h1 className="font-display text-2xl font-bold text-text-heading">Connexions</h1>
        <p className="text-xs text-text-body-subtle">
          {connections.length > 0
            ? `${connections.length} connecté${connections.length !== 1 ? "s" : ""}`
            : "Invitez quelqu'un pour commencer"}
        </p>
      </div>

      {/* Long-press hint */}
      {showHint && connections.length > 0 && (
        <motion.button
          onClick={dismissHint}
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2 text-left text-[11px]"
          style={{
            background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
            color: "var(--text-body-subtle)",
          }}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span>Astuce : restez appuyé sur une connexion pour la modifier ou la supprimer.</span>
          <span className="text-[10px] font-semibold" style={{ color: "var(--accent-purple)" }}>
            Compris
          </span>
        </motion.button>
      )}

      {/* Rhythm inbox */}
      <ConnectionList
        connections={connections}
        myBirthData={myBirthData}
        onDeleted={handleDeleted}
      />

      {/* Divider */}
      <div className="my-5 h-px" style={{ background: "var(--surface-medium)" }} />

      {/* Share + enter code */}
      <div className="space-y-3">
        <Link
          href="/demo/invite/share"
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors"
          style={{ background: "var(--surface-light)", border: "1px solid var(--border-tint-light)" }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--border-tint-light)" }}
          >
            <ShareNodes size={16} style={{ color: "var(--accent-purple)" }} />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-text-heading">Partager votre code</p>
            <p className="text-[11px] text-text-body-subtle">
              Invitez quelqu&apos;un à comparer vos rythmes
            </p>
          </div>
          <span
            className="text-xs font-mono font-semibold tracking-wider"
            style={{ color: "var(--accent-purple)" }}
          >
            {myCode}
          </span>
        </Link>

        {!showCodeInput ? (
          <button
            onClick={() => setShowCodeInput(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
            style={{
              border: "1px solid var(--border-tint-medium)",
              color: "var(--accent-purple)",
            }}
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
