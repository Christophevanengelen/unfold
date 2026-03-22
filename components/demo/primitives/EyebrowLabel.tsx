/**
 * EyebrowLabel — tiny uppercase tracking label.
 * Used above sections, cards, and form groups throughout the demo app.
 */

interface EyebrowLabelProps {
  children: React.ReactNode;
  color?: string;
  className?: string;
}

export function EyebrowLabel({ children, color, className = "" }: EyebrowLabelProps) {
  return (
    <p
      className={`text-[10px] font-bold uppercase tracking-widest ${className}`}
      style={color ? { color } : undefined}
    >
      {children}
    </p>
  );
}
