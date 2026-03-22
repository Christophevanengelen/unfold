"use client";

import { useTheme } from "next-themes";
import { User, Sun, Moon } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { birthData } = useMomentum();

  const userName = birthData?.nickname || "You";

  return (
    <BottomSheet open={open} onClose={onClose} maxHeight="60%">
      <div className="px-6 pb-8">
        {/* User info */}
        <div className="flex items-center gap-3 pb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-brand-soft">
            <User size={22} className="text-accent-purple" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-text-heading">
              {userName}
            </p>
            <p className="text-xs text-text-body-subtle capitalize">
              free plan
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="mb-4 h-px bg-brand-3" />

        {/* Settings */}
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
          Settings
        </p>
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
        >
          <span className="flex items-center gap-2.5">
            {isDark ? (
              <Moon size={16} className="text-text-body-subtle" />
            ) : (
              <Sun size={16} className="text-text-body-subtle" />
            )}
            Appearance
          </span>
          <span className="text-xs text-text-body-subtle">
            {isDark ? "Dark" : "Light"}
          </span>
        </button>
      </div>
    </BottomSheet>
  );
}
