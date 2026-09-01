"use client";

import { useCallback, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { ThumbsUp, ThumbsDown } from "flowbite-react-icons/outline";
import { springs } from "@/lib/animations";

// ─── Props ───────────────────────────────────────────────
interface FeedbackThumbProps {
  capsuleId: string;
  onFeedback?: (positive: boolean) => void;
}

type Avis = "up" | "down" | null;

// ─── localStorage key ────────────────────────────────────
function storageKey(capsuleId: string) {
  return `feedback_${capsuleId}`;
}

/**
 * L avis vit dans localStorage, donc HORS de React.
 *
 * Il etait charge par un useEffect qui appelait setChoice apres le montage :
 * les deux pouces s affichaient donc ETEINTS a l ouverture de la feuille, puis
 * celui deja choisi s allumait. Sur un detail qu on rouvre souvent, cela se
 * voit. Le motif de lib/use-locale.ts et lib/messages.ts s applique tel quel —
 * la seule difference est que l avis depend d une capsule, donc l instantane
 * est referme sur son identifiant par le useCallback ci-dessous.
 *
 * Pas de memoisation : l instantane est une chaine ou null, compare par valeur.
 * C est le tableau frais a chaque lecture qui fait boucler ce hook, pas une
 * relecture.
 */
const abonnes = new Set<() => void>();

function lireAvis(capsuleId: string): Avis {
  try {
    const brut = localStorage.getItem(storageKey(capsuleId));
    return brut === "up" || brut === "down" ? brut : null;
  } catch {
    // Stockage refuse : pas d avis, et l ecran reste utilisable.
    return null;
  }
}

function abonner(prevenir: () => void): () => void {
  abonnes.add(prevenir);
  // Un autre onglet peut avoir vote sur la meme capsule.
  window.addEventListener("storage", prevenir);
  return () => {
    abonnes.delete(prevenir);
    window.removeEventListener("storage", prevenir);
  };
}

function ecrireAvis(capsuleId: string, avis: Avis): void {
  try {
    if (avis) localStorage.setItem(storageKey(capsuleId), avis);
    else localStorage.removeItem(storageKey(capsuleId));
  } catch {
    // silent
  }
  // L evenement `storage` ne se declenche PAS dans l onglet qui ecrit : sans ce
  // reveil, le pouce ne s allumerait jamais sous le doigt.
  for (const prevenir of abonnes) prevenir();
}

/** Le serveur n a pas de stockage : aucun avis, le client corrige des la
    premiere image. */
function lireServeur(): Avis {
  return null;
}

// ─── Component ───────────────────────────────────────────

/**
 * Inline feedback thumbs — up/down.
 * Subtle, muted by default. Persists choice in localStorage.
 * Placed at the bottom of CapsuleDetailSheet.
 */
export function FeedbackThumb({ capsuleId, onFeedback }: FeedbackThumbProps) {
  const choice = useSyncExternalStore(
    abonner,
    useCallback(() => lireAvis(capsuleId), [capsuleId]),
    lireServeur,
  );

  const handleTap = useCallback(
    (value: "up" | "down") => {
      // Toggle off if already selected, otherwise set
      const next = choice === value ? null : value;
      // On ecrit dans le stockage, et c est l abonnement qui rend : plus de
      // double verite entre un etat React et localStorage.
      ecrireAvis(capsuleId, next);
      if (next && onFeedback) {
        onFeedback(next === "up");
      }
    },
    [capsuleId, choice, onFeedback],
  );

  return (
    <div className="flex items-center gap-3">
      <ThumbButton
        direction="up"
        active={choice === "up"}
        dimmed={choice === "down"}
        onTap={() => handleTap("up")}
      />
      <ThumbButton
        direction="down"
        active={choice === "down"}
        dimmed={choice === "up"}
        onTap={() => handleTap("down")}
      />
    </div>
  );
}

// ─── Individual Thumb Button ─────────────────────────────

function ThumbButton({
  direction,
  active,
  dimmed,
  onTap,
}: {
  direction: "up" | "down";
  active: boolean;
  dimmed: boolean;
  onTap: () => void;
}) {
  const opacity = active ? 1 : dimmed ? 0.15 : 0.3;
  const Icon = direction === "up" ? ThumbsUp : ThumbsDown;

  return (
    <motion.button
      type="button"
      onClick={onTap}
      whileTap={{ scale: 1.25 }}
      transition={springs.bouncy}
      className="flex items-center justify-center rounded-lg p-1.5 transition-opacity"
      style={{ opacity }}
      aria-label={direction === "up" ? "Helpful" : "Not helpful"}
    >
      <Icon
        size={16}
        style={{
          color: active ? "var(--accent-purple)" : "var(--text-body-subtle)",
        }}
      />
    </motion.button>
  );
}
