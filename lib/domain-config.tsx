/**
 * Centralized domain configuration — single source of truth.
 *
 * Every component that needs domain icons, colors, or labels imports from here.
 * Change once → reflected everywhere.
 */

export type DomainKey = "love" | "health" | "work";

/** Ordered list of all domains */
export const DOMAINS: DomainKey[] = ["love", "health", "work"];

interface DomainMeta {
  /** Display label (uppercase) */
  label: string;
  /** CSS custom property for the domain color */
  color: string;
  /** Tailwind bg class for colored dots */
  dotClass: string;
  /** Domain SVG icon — solid/filled, accepts optional size (default 20) */
  icon: (opts?: { size?: number }) => React.ReactNode;
}

export const domainConfig: Record<DomainKey, DomainMeta> = {
  love: {
    label: "LOVE",
    color: "var(--accent-pink)",
    dotClass: "bg-accent-pink",
    icon: ({ size = 20 } = {}) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  health: {
    label: "HEALTH",
    color: "var(--accent-green)",
    dotClass: "bg-accent-green",
    icon: ({ size = 20 } = {}) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" />
      </svg>
    ),
  },
  work: {
    label: "WORK",
    color: "var(--accent-blue)",
    dotClass: "bg-accent-blue",
    icon: ({ size = 20 } = {}) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20 7h-4V5c0-1.1-.9-2-2-2h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5z" />
      </svg>
    ),
  },
};
