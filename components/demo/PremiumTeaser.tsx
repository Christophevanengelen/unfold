"use client";

import { CalendarMonth, Fire, Grid } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";

interface PremiumTeaserProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  {
    icon: CalendarMonth,
    text: "7-day forecast with peak markers",
  },
  {
    icon: Fire,
    text: "Real-time peak alerts",
  },
  {
    icon: Grid,
    text: "Monthly momentum map",
  },
];

export function PremiumTeaser({ open, onClose }: PremiumTeaserProps) {
  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="70%">
      <div className="px-6 pb-8">
        {/* Blurred preview area */}
        <div
          className="mb-6 rounded-2xl"
          style={{
            height: 60,
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--bg-brand-soft) 40%, var(--bg-primary)), var(--bg-primary))",
            backdropFilter: "blur(8px)",
          }}
        />

        {/* Headline */}
        <h2
          className="mb-2 font-display font-bold"
          style={{
            fontSize: 20,
            color: "var(--text-heading)",
            letterSpacing: -0.5,
          }}
        >
          Unlock your timing advantage
        </h2>
        <p
          className="mb-6 text-[13px]"
          style={{ color: "var(--text-body-subtle)" }}
        >
          See what&apos;s coming before it arrives
        </p>

        {/* Feature bullets */}
        <div className="mb-8 space-y-4">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{
                  background: "var(--surface-strong)",
                }}
              >
                <f.icon
                  size={16}
                  style={{ color: "var(--accent-purple)" }}
                />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: "var(--text-heading)" }}
              >
                {f.text}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          type="button"
          className="mb-3 w-full rounded-2xl py-3.5 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{
            background: "var(--bg-brand)",
            color: "var(--text-on-brand)",
          }}
          onClick={onClose}
        >
          Upgrade to Premium
        </button>

        {/* Dismiss */}
        <button
          type="button"
          className="w-full py-2 text-xs font-medium"
          style={{ color: "var(--text-body-subtle)" }}
          onClick={onClose}
        >
          Not now
        </button>
      </div>
    </BottomSheet>
  );
}
