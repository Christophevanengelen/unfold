"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { UserEdit, Pen, ShareNodes, TrashBin } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives/BottomSheet";
import {
  updateRelationship,
  renameConnection,
  removeConnection,
  type RelationshipType,
  type RealConnection,
} from "@/lib/connections-store";
import { relationshipConfig, relationshipOrder } from "./relationshipConfig";

interface ConnectionActionSheetProps {
  open: boolean;
  onClose: () => void;
  connection: RealConnection | null;
  /** Called after a destructive action (delete) so the parent can remove from view. */
  onDeleted?: (id: string) => void;
}

type View = "menu" | "rename" | "relationship" | "confirmDelete";

/**
 * Bottom sheet that surfaces connection-level actions:
 *   Rename / Change relationship / Share / Delete.
 *
 * Reached via long-press on a ConnectionRow (400ms hold — matches WhatsApp).
 * Hold-to-confirm (1s) on Delete prevents accidental taps.
 */
export function ConnectionActionSheet({
  open,
  onClose,
  connection,
  onDeleted,
}: ConnectionActionSheetProps) {
  const [view, setView] = useState<View>("menu");
  const [nameDraft, setNameDraft] = useState("");
  const [deleteHoldProgress, setDeleteHoldProgress] = useState(0);

  // Reset view when sheet opens for a different connection
  useEffect(() => {
    if (open && connection) {
      setView("menu");
      setNameDraft(connection.name);
      setDeleteHoldProgress(0);
    }
  }, [open, connection]);

  if (!connection) {
    return <BottomSheet open={open} onClose={onClose}>{null}</BottomSheet>;
  }

  const rel = relationshipConfig[connection.relationship];

  const handleRename = () => {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== connection.name) {
      renameConnection(connection.id, trimmed);
    }
    onClose();
  };

  const handleChangeRelationship = (key: RelationshipType) => {
    if (key !== connection.relationship) {
      updateRelationship(connection.id, key);
    }
    onClose();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/demo/compatibility/${connection.id}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Rythme avec ${connection.name}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      /* user cancelled */
    }
    onClose();
  };

  const handleDelete = () => {
    removeConnection(connection.id);
    onDeleted?.(connection.id);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="60%">
      <div className="px-5 pb-6 pt-2">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
            style={{
              background: `color-mix(in srgb, ${rel.color} 20%, transparent)`,
              color: rel.color,
            }}
          >
            {connection.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-heading">
              {connection.name}
            </p>
            <p className="text-[11px] text-text-body-subtle">{rel.labelFR}</p>
          </div>
        </div>

        {view === "menu" && (
          <div className="space-y-1">
            <ActionRow
              icon={<Pen width={16} height={16} />}
              label="Renommer"
              onClick={() => setView("rename")}
            />
            <ActionRow
              icon={<UserEdit width={16} height={16} />}
              label="Modifier la relation"
              onClick={() => setView("relationship")}
              subtitle={rel.labelFR}
            />
            <ActionRow
              icon={<ShareNodes width={16} height={16} />}
              label="Partager le rapport"
              onClick={handleShare}
            />
            <div className="my-2 h-px" style={{ background: "var(--border-base)" }} />
            <ActionRow
              icon={<TrashBin width={16} height={16} />}
              label="Supprimer la connexion"
              onClick={() => setView("confirmDelete")}
              destructive
            />
          </div>
        )}

        {view === "rename" && (
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-text-body-subtle">
              Nouveau nom
            </label>
            <input
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              autoFocus
              maxLength={40}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: "var(--surface-light)",
                color: "var(--text-heading)",
                border: "1.5px solid var(--accent-purple)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRename();
                if (e.key === "Escape") setView("menu");
              }}
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setView("menu")}
                className="flex-1 rounded-full py-2.5 text-xs font-semibold"
                style={{ background: "var(--surface-light)", color: "var(--text-body)" }}
              >
                Annuler
              </button>
              <button
                onClick={handleRename}
                disabled={!nameDraft.trim()}
                className="flex-1 rounded-full py-2.5 text-xs font-semibold disabled:opacity-50"
                style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        )}

        {view === "relationship" && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-body-subtle">
              Type de relation
            </p>
            <div className="grid grid-cols-2 gap-2">
              {relationshipOrder.map((key) => {
                const r = relationshipConfig[key];
                const isCurrent = key === connection.relationship;
                const Icon = r.Icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleChangeRelationship(key)}
                    className="flex items-center gap-2 rounded-xl px-3 py-3 text-[13px] font-medium transition-all active:scale-95"
                    style={{
                      background: isCurrent
                        ? `color-mix(in srgb, ${r.color} 20%, transparent)`
                        : "var(--surface-light)",
                      border: `1.5px solid ${isCurrent ? r.color : "transparent"}`,
                      color: isCurrent ? r.color : "var(--text-body)",
                    }}
                  >
                    <Icon width={14} height={14} style={{ color: r.color }} />
                    {r.labelFR}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setView("menu")}
              className="mt-4 w-full rounded-full py-2.5 text-xs font-semibold"
              style={{ background: "var(--surface-light)", color: "var(--text-body)" }}
            >
              Retour
            </button>
          </div>
        )}

        {view === "confirmDelete" && (
          <div className="text-center">
            <p className="text-sm font-semibold text-text-heading">
              Supprimer {connection.name} ?
            </p>
            <p className="mt-1 text-[11px] text-text-body-subtle">
              Le rapport ne sera plus visible. Action irréversible.
            </p>
            <HoldToConfirmButton
              onConfirm={handleDelete}
              progress={deleteHoldProgress}
              setProgress={setDeleteHoldProgress}
            />
            <button
              onClick={() => setView("menu")}
              className="mt-3 w-full rounded-full py-2.5 text-xs font-semibold"
              style={{ background: "var(--surface-light)", color: "var(--text-body)" }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </BottomSheet>
  );
}

// ─── Action row ──────────────────────────────────────────

function ActionRow({
  icon,
  label,
  subtitle,
  onClick,
  destructive,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick: () => void;
  destructive?: boolean;
}) {
  const fg = destructive ? "var(--danger, #E07A7C)" : "var(--text-heading)";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-[color:var(--surface-light)]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          background: destructive
            ? "color-mix(in srgb, var(--danger, #E07A7C) 15%, transparent)"
            : "var(--surface-light)",
          color: fg,
        }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium" style={{ color: fg }}>
          {label}
        </span>
        {subtitle && (
          <span className="block text-[11px] text-text-body-subtle">{subtitle}</span>
        )}
      </span>
    </button>
  );
}

// ─── Hold-to-confirm ─────────────────────────────────────

function HoldToConfirmButton({
  onConfirm,
  progress,
  setProgress,
}: {
  onConfirm: () => void;
  progress: number;
  setProgress: (n: number) => void;
}) {
  const HOLD_MS = 1000;
  const [holding, setHolding] = useState(false);

  useEffect(() => {
    if (!holding) {
      setProgress(0);
      return;
    }
    const t0 = Date.now();
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        onConfirm();
        setHolding(false);
      }
    };
    const id = setInterval(tick, 16);
    return () => clearInterval(id);
  }, [holding, onConfirm, setProgress]);

  return (
    <button
      onMouseDown={() => setHolding(true)}
      onMouseUp={() => setHolding(false)}
      onMouseLeave={() => setHolding(false)}
      onTouchStart={() => setHolding(true)}
      onTouchEnd={() => setHolding(false)}
      className="relative mt-5 w-full overflow-hidden rounded-full py-3 text-sm font-semibold"
      style={{
        background: "color-mix(in srgb, var(--danger, #E07A7C) 15%, transparent)",
        color: "var(--danger, #E07A7C)",
      }}
    >
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${progress * 100}%`,
          background: "var(--danger, #E07A7C)",
          opacity: 0.25,
        }}
      />
      <span className="relative">
        {progress >= 1
          ? "Suppression…"
          : holding
            ? "Maintiens pour confirmer"
            : "Maintenir pour supprimer"}
      </span>
    </button>
  );
}
