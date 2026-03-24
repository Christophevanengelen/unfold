/**
 * Layout Constants — single source of truth for the entire UI.
 *
 * 8px base grid (Apple HIG + Material Design).
 * All spacing = multiples of BASE.
 * Import `S` for spacing, `LAYOUT` for structural dimensions.
 *
 * Rule: internal spacing ≤ external spacing.
 * Rule: touch targets ≥ 44px (Apple HIG).
 * Rule: one-handed use — primary actions in thumb zone (bottom 60%).
 */

// ─── Base grid ───────────────────────────────────────────

const BASE = 8;

// ─── Spacing tokens ──────────────────────────────────────

export const S = {
  /** 4px — icon-to-text, tight pairs */
  xs: BASE / 2,
  /** 8px — related elements, small gaps */
  sm: BASE,
  /** 16px — between sections within a component */
  md: BASE * 2,
  /** 24px — section breaks */
  lg: BASE * 3,
  /** 32px — major sections */
  xl: BASE * 4,
  /** 20px — horizontal edge padding (2.5 × base for thumb comfort) */
  px: 20,
  /** 44px — minimum touch target (Apple HIG) */
  touch: 44,
} as const;

// ─── Structural layout ──────────────────────────────────

/** Status bar height in px */
export const STATUS_BAR_H = 44;

/** Bottom nav height in px (h-14 = 56px) */
export const BOTTOM_NAV_H = 56;

/** Safe padding top — clears status bar + breathing room */
export const SAFE_TOP = STATUS_BAR_H + S.sm; // 52px

/** Safe padding bottom — clears bottom nav + breathing room */
export const SAFE_BOTTOM = BOTTOM_NAV_H + S.sm; // 64px

/** Full layout structure */
export const LAYOUT = {
  statusBarH: STATUS_BAR_H,
  bottomNavH: BOTTOM_NAV_H,
  safeTop: SAFE_TOP,
  safeBottom: SAFE_BOTTOM,
  /** Briefing card top position */
  briefingTop: SAFE_TOP + S.xs, // 56px
  /** View toggle bottom position (above bottom nav) */
  toggleBottom: BOTTOM_NAV_H + S.md, // 72px
} as const;

/** CSS custom property names (set on layout, consumed by full-bleed pages) */
export const CSS_SAFE_TOP = "--safe-top";
export const CSS_SAFE_BOTTOM = "--safe-bottom";
