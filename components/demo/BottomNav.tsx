"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Activity, Heart } from "lucide-react";

const navItems = [
  {
    key: "momentum" as const,
    href: "/demo",
    icon: Activity,
    label: "Momentum",
  },
  {
    key: "match" as const,
    href: "/demo/compatibility",
    icon: Heart,
    label: "Match",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="glass flex items-center justify-around" style={{ height: 48 }}>
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
            className="relative flex flex-col items-center justify-center gap-0.5 px-8 py-2"
            aria-label={item.label}
          >
            <Icon
              size={20}
              strokeWidth={isActive ? 2 : 1.5}
              className={`transition-all duration-200 ${
                isActive ? "text-accent-purple" : "text-text-body-subtle"
              }`}
            />
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
