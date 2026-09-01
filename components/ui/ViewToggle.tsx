/**
 * 3-way segmented toggle for landing page phone mockups (Focus | All | List).
 * Decorative only — no state.
 */
export function ViewToggle() {
  return (
    <div
      className="flex items-center rounded-full"
      style={{
        // Le contour valait exactement la meme couleur que le fond : il ne
        // dessinait rien que le fond ne disait deja. C est le fond qui detache
        // la piste du segment, pas un trait.
        background: "color-mix(in srgb, var(--brand-6) 15%, transparent)",
        padding: 2,
      }}
    >
      <div
        className="rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider"
        style={{
          // Le segment actif se lit sur son fond : 25 % de violet contre les
          // 15 % de brand-6 de la piste. Un lisere de 30 % en plus ne faisait
          // que redire la meme separation une seconde fois.
          background: "color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          color: "var(--accent-purple)",
        }}
      >
        Focus
      </div>
      <div className="px-2 py-1 text-[8px] font-medium uppercase tracking-wider" style={{ color: "var(--text-disabled)" }}>
        All
      </div>
      <div className="px-2 py-1 text-[8px] font-medium uppercase tracking-wider" style={{ color: "var(--text-disabled)" }}>
        List
      </div>
    </div>
  );
}
