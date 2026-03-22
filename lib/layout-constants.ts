/**
 * Layout Constants — single source of truth for safe area dimensions.
 * Used by layout.tsx and any full-bleed page that manages its own scroll.
 *
 * STATUS BAR: absolute overlay at top (z-30), glass blur
 * BOTTOM NAV: absolute overlay at bottom (z-30), glass blur
 * Content must pad top/bottom to avoid clipping behind these overlays.
 */

/** Status bar height in px (pt-3 + content + pb-2) */
export const STATUS_BAR_H = 44;

/** Bottom nav height in px (h-14 = 56px) */
export const BOTTOM_NAV_H = 56;

/** Safe padding top — clears status bar + breathing room */
export const SAFE_TOP = STATUS_BAR_H + 8; // 52px

/** Safe padding bottom — clears bottom nav + breathing room */
export const SAFE_BOTTOM = BOTTOM_NAV_H + 8; // 64px

/** CSS custom property names (set on layout, consumed by full-bleed pages) */
export const CSS_SAFE_TOP = "--safe-top";
export const CSS_SAFE_BOTTOM = "--safe-bottom";
