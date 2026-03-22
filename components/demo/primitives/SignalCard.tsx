/**
 * SignalCard — the rounded-2xl tinted surface used throughout the demo
 * to display signal information blocks (insights, guidance, cycle info, etc.)
 */

interface SignalCardProps {
  children: React.ReactNode;
  /** Tint intensity: subtle (6%), medium (10%), or strong (15%) */
  tint?: "subtle" | "medium" | "strong";
  /** Optional custom color for the tint (defaults to accent-purple) */
  color?: string;
  className?: string;
}

const tintPercent = {
  subtle: "6%",
  medium: "10%",
  strong: "15%",
};

export function SignalCard({
  children,
  tint = "subtle",
  color = "var(--accent-purple)",
  className = "",
}: SignalCardProps) {
  return (
    <div
      className={`rounded-xl px-4 py-3 ${className}`}
      style={{
        background: `color-mix(in srgb, ${color} ${tintPercent[tint]}, var(--bg-tertiary))`,
      }}
    >
      {children}
    </div>
  );
}
