/**
 * 3-way segmented toggle for landing page phone mockups (Focus | All | List).
 * Decorative only — no state.
 */
export function ViewToggle() {
  return (
    <div
      className="flex items-center rounded-full"
      style={{
        background: "color-mix(in srgb, var(--brand-6) 15%, transparent)",
        border: "1px solid color-mix(in srgb, var(--brand-6) 15%, transparent)",
        padding: 2,
      }}
    >
      <div
        className="rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider"
        style={{
          background: "color-mix(in srgb, var(--accent-purple) 25%, transparent)",
          color: "var(--accent-purple)",
          border: "1px solid color-mix(in srgb, var(--accent-purple) 30%, transparent)",
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
