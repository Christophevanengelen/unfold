"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Activity, Heart, Clock, Calendar } from "lucide-react";

const navItems = [
  {
    key: "momentum" as const,
    href: "/demo",
    icon: Activity,
    label: "Today",
  },
  {
    key: "timeline" as const,
    href: "/demo/timeline",
    icon: Clock,
    label: "Timeline",
  },
  {
    key: "monthly" as const,
    href: "/demo/monthly",
    icon: Calendar,
    label: "Month",
  },
  {
    key: "match" as const,
    href: "/demo/compatibility",
    icon: Heart,
    label: "Match",
    badge: 3,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center justify-around pb-2" style={{
      height: 56,
      background: "color-mix(in srgb, var(--accent-purple) 8%, rgba(27, 21, 53, 0.85))",
      border: "none",
      borderTop: "1px solid color-mix(in srgb, var(--accent-purple) 15%, transparent)",
      backdropFilter: "blur(16px)",
    }}>
      {navItems.map((item) => {
        const isActive =
          item.key === "momentum"
            ? pathname === "/demo"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.key}
            href={item.href}
            className="relative flex flex-col items-center justify-center gap-0.5 px-5 py-2"
            aria-label={item.label}
          >
            <div className="relative">
              <Icon
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
                className={`transition-all duration-200 ${
                  isActive ? "text-accent-purple" : "text-text-body-subtle"
                }`}
              />
              {(item.badge ?? 0) > 0 && (
                <span
                  className="absolute -right-1.5 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full px-1 text-[8px] font-bold text-white"
                  style={{ backgroundColor: "var(--accent-pink)" }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            {isActive && (
              <motion.span
                layoutId="nav-indicator"
                className="absolute bottom-1 h-[2px] w-4 rounded-full bg-accent-purple"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
