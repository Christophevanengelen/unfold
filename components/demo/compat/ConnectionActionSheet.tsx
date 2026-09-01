"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
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
import { texteLisible } from "@/lib/contraste";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

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
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "clair" : "sombre";
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
    const url = `${window.location.origin}/app/compatibility/${connection.id}`;
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
            // Regle 3 : le fond est fait de rel.color a 20 % et l initiale
            // prenait rel.color pure — ils convergent par construction.
            // rel.color vient de l execution, donc on derive au rendu.
            style={{
              background: `color-mix(in srgb, ${rel.color} 20%, transparent)`,
              color: texteLisible(rel.color, theme, 0.2),
            }}
          >
            {connection.initial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-heading">
              {connection.name}
            </p>
            <p className="text-[11px] text-text-body-subtle">{perso(rel.cleLabel, locale)}</p>
          </div>
        </div>

        {view === "menu" && (
          <div className="space-y-1">
            <ActionRow
              icon={<Pen width={16} height={16} />}
              label={perso("compat.renommer", locale)}
              onClick={() => setView("rename")}
            />
            <ActionRow
              icon={<UserEdit width={16} height={16} />}
              label={perso("compat.modifier_rel", locale)}
              onClick={() => setView("relationship")}
              subtitle={perso(rel.cleLabel, locale)}
            />
            <ActionRow
              icon={<ShareNodes width={16} height={16} />}
              label={perso("compat.partager_rap", locale)}
              onClick={handleShare}
            />
            <div className="my-2 h-px" style={{ background: "var(--border-base)" }} />
            <ActionRow
              icon={<TrashBin width={16} height={16} />}
              label={perso("compat.supprimer", locale)}
              onClick={() => setView("confirmDelete")}
              destructive
            />
          </div>
        )}

        {view === "rename" && (
          <div>
            <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-text-body-subtle">
              {perso("compat.nouveau_nom", locale)}
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
                {perso("compat.annuler", locale)}
              </button>
              <button
                onClick={handleRename}
                disabled={!nameDraft.trim()}
                className="flex-1 rounded-full py-2.5 text-xs font-semibold disabled:opacity-50"
                style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
              >
                {perso("compat.enregistrer", locale)}
              </button>
            </div>
          </div>
        )}

        {view === "relationship" && (
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-text-body-subtle">
              {perso("compat.type_relation", locale)}
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
                      // La bordure garde la couleur pure : c est l identite du
                      // type de relation, et une bordure n est pas du texte.
                      border: `1.5px solid ${isCurrent ? r.color : "transparent"}`,
                      // Le libelle, lui, converge avec sa propre tuile. C etait
                      // la puce SELECTIONNEE — celle qu on vient de choisir —
                      // qui etait la moins lisible des quatre.
                      color: isCurrent ? texteLisible(r.color, theme, 0.2) : "var(--text-body)",
                    }}
                  >
                    <Icon
                      width={14}
                      height={14}
                      // L icone est posee sur la tuile quand la puce est
                      // choisie, sur --surface-light sinon : deux fonds, deux
                      // valeurs. Sur --surface-light la couleur pure tient,
                      // c est le fond teinte qui la fait converger.
                      style={{ color: isCurrent ? texteLisible(r.color, theme, 0.2) : r.color }}
                    />
                    {perso(r.cleLabel, locale)}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setView("menu")}
              className="mt-4 w-full rounded-full py-2.5 text-xs font-semibold"
              style={{ background: "var(--surface-light)", color: "var(--text-body)" }}
            >
              {perso("compat.retour", locale)}
            </button>
          </div>
        )}

        {view === "confirmDelete" && (
          <div className="text-center">
            <p className="text-sm font-semibold text-text-heading">
              Supprimer {connection.name} ?
            </p>
            <p className="mt-1 text-[11px] text-text-body-subtle">
              {perso("compat.irreversible", locale)}
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
              {perso("compat.annuler", locale)}
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
  // --danger vaut #E5484D dans les deux themes et donne 3,51 sur le fond
  // clair : le libelle « Supprimer » etait sous le seuil, et son repli en dur
  // #E07A7C ne servait qu a masquer que le jeton existe. --text-erreur est le
  // jeton derive pour ce role — 4,58 en clair, 6,64 en sombre.
  const fg = destructive ? "var(--text-erreur)" : "var(--text-heading)";
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors active:bg-[color:var(--surface-light)]"
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
        style={{
          // La pastille reste teintee d alerte, mais avec --bg-alerte et non
          // avec la couleur du texte : les deux ne doivent pas converger.
          // L icone dessus vaut 3,74 en clair — c est un objet graphique, pour
          // lequel le seuil est 3, et le libelle qui le nomme est a cote sur
          // le fond de la feuille, a 4,58.
          background: destructive
            ? "color-mix(in srgb, var(--bg-alerte) 15%, transparent)"
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
  const locale = detectLocale();
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
      // C est LE bouton de confirmation de suppression. Il peignait --danger
      // sur une tuile faite de --danger : convergence de la regle 3, sur une
      // action irreversible. La regle 2 nomme la paire pour ce cas precis.
      style={{
        background: "var(--bg-alerte)",
        color: "var(--text-on-alerte)",
      }}
    >
      <motion.div
        className="absolute inset-y-0 left-0"
        style={{
          width: `${progress * 100}%`,
          // La jauge se remplit maintenant PAR-DESSUS l aplat d alerte : elle
          // reprend la couleur du texte, voilee, pour rester visible sans
          // passer sous le libelle.
          background: "var(--text-on-alerte)",
          opacity: 0.25,
        }}
      />
      <span className="relative">
        {progress >= 1
          ? perso("compat.suppression", locale)
          : holding
            ? perso("compat.maintiens", locale)
            : perso("compat.maintenir", locale)}
      </span>
    </button>
  );
}
