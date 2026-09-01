import { UnfoldLogo } from "@/components/demo/UnfoldLogo";

/**
 * Decorative phone status bar for landing page mockups.
 * Consistent across all phone frames: time + Unfold logo + avatar circle.
 */
export function MiniStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5">
      <span className="text-[10px] font-medium" style={{ color: "var(--text-body-subtle)" }}>
        9:41
      </span>
      <UnfoldLogo size={16} />
      <div
        className="h-5 w-5 rounded-full"
        style={{
          // La pastille d avatar est un disque plein : son fond suffit a la
          // faire exister. Le contour, plus PALE que le fond qu il entourait,
          // ne servait qu a l adoucir — c est du decor.
          background: "color-mix(in srgb, var(--brand-6) 30%, transparent)",
        }}
      />
    </div>
  );
}
