"use client";

import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { mockUser } from "@/lib/mock-data";
import { User, ChevronRight, Sun, Moon } from "lucide-react";

interface ProfileDrawerProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { href: "/demo/onboarding", label: "Onboarding Flow" },
  { href: "/demo/invite", label: "Invite Flow" },
];

export function ProfileDrawer({ open, onClose }: ProfileDrawerProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-3xl bg-bg-primary px-6 pb-8 pt-4"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ boxShadow: "var(--shadow-elevated, 0 -4px 24px rgba(0,0,0,0.12))" }}
          >
            {/* Handle */}
            <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-brand-5" />

            {/* User info */}
            <div className="flex items-center gap-3 pb-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-brand-soft">
                <User
                  size={22}
                  strokeWidth={1.5}
                  className="text-accent-purple"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-text-heading">
                  {mockUser.name}
                </p>
                <p className="text-xs text-text-body-subtle capitalize">
                  {mockUser.plan} plan
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="mb-4 h-px bg-brand-3" />

            {/* Demo flows */}
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-body-subtle">
              Demo Flows
            </p>
            <div className="space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-text-heading transition-colors hover:bg-bg-secondary"
                >
                  {item.label}
                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="text-text-body-subtle"
                  />
                </Link>
              ))}
            </div>

            {/* Divider */}
            <div className="mt-4 mb-4 h-px bg-brand-3" />

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
                  <Moon size={16} strokeWidth={1.5} className="text-text-body-subtle" />
                ) : (
                  <Sun size={16} strokeWidth={1.5} className="text-text-body-subtle" />
                )}
                Appearance
              </span>
              <span className="text-xs text-text-body-subtle">
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
