"use client";

interface TierPulseProps {
  color: string;
  size?: number;
  /**
   * Anneau creux plutot que point plein.
   *
   * Sur la timeline, la capsule porte deja des points pleins : ce sont ses
   * planetes, du CONTENU. Un repere plein au meme endroit se confondait avec
   * eux — deux petits ronds identiques, dont un seul voulait dire « en ce
   * moment ». Creux, il se lit comme une cible et non comme une donnee.
   */
  creux?: boolean;
}

/**
 * Breathing dot — surfaces active PEAK windows in the list.
 * Style = Apple Find My "nearby" indicator: inner dot + expanding ping ring.
 */
export function TierPulse({ color, size = 8, creux = false }: TierPulseProps) {
  return (
    <span
      className="relative inline-flex shrink-0"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={
          creux
            ? { boxShadow: `0 0 0 1.5px ${color}`, opacity: 0.55 }
            : { background: color, opacity: 0.4 }
        }
      />
      <span
        className="relative inline-block rounded-full"
        style={
          creux
            ? {
                width: size,
                height: size,
                // Le coeur reprend le fond de la page, pas du transparent : la
                // capsule a une surface teintee derriere, et un anneau pose
                // dessus sans coeur opaque se lit comme une tache.
                background: "var(--bg-primary)",
                boxShadow: `0 0 0 2px ${color}`,
              }
            : { width: size, height: size, background: color }
        }
      />
    </span>
  );
}
