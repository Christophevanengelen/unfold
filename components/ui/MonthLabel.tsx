/**
 * Month/year label for landing page timeline phone mockups.
 * Positioned absolutely — parent must be `position: relative`.
 */
export function MonthLabel({ label, bold, y }: { label: string; bold?: boolean; y: number }) {
  return (
    <div className="absolute" style={{ top: y, left: 8 }}>
      <div
        className="absolute"
        style={{
          top: 0,
          left: bold ? 30 : 24,
          width: bold ? 12 : 6,
          height: 1,
          background: bold
            ? "color-mix(in srgb, var(--brand-6) 40%, transparent)"
            : "color-mix(in srgb, var(--brand-5) 12%, transparent)",
        }}
      />
      <span
        className="absolute -top-1.5 text-[7px] tabular-nums"
        style={{
          left: 0,
          width: bold ? 28 : 22,
          textAlign: "right",
          color: bold ? "var(--text-body-subtle)" : "var(--text-disabled)",
          fontWeight: bold ? 600 : 400,
          fontSize: bold ? 8 : 7,
        }}
      >
        {label}
      </span>
    </div>
  );
}
