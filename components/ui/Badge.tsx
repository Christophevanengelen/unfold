type BadgeVariant = "ready" | "draft" | "not-started" | "default";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  "not-started": "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  default: "bg-bg-brand-soft text-accent-purple",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
