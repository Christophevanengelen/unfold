/**
 * Decorative bottom navigation for landing page phone mockups.
 * 3 tabs: Home, Timeline, Match (with notification badge).
 * Pass `active` to highlight a specific tab.
 */
export function MockBottomNav({ active = "timeline" }: { active?: "home" | "timeline" | "match" }) {
  const color = (tab: string) => tab === active ? "var(--accent-purple)" : "var(--text-disabled)";

  return (
    <div
      className="flex items-center justify-around px-6 py-3"
      style={{ borderTop: "1px solid color-mix(in srgb, var(--brand-6) 12%, transparent)" }}
    >
      {/* Home */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color("home")} strokeWidth="1.5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
      </svg>
      {/* Timeline */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color("timeline")} strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
      {/* Match */}
      <div className="relative">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color("match")} strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <div
          className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[7px] font-bold text-white"
          style={{ background: "var(--accent-pink)" }}
        >
          3
        </div>
      </div>
    </div>
  );
}
