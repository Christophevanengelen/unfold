"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Heart, Clock } from "flowbite-react-icons/outline";
import { getConnections } from "@/lib/connections-store";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";

export function BottomNav() {
  const pathname = usePathname();
  const [connectionCount, setConnectionCount] = useState(0);
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    setConnectionCount(getConnections().length);
    setLocaleState(detectLocale());
    const onLocaleChange = (e: Event) => {
      const detail = (e as CustomEvent<Locale>).detail;
      if (detail) setLocaleState(detail);
    };
    window.addEventListener("unfold:locale-changed", onLocaleChange);
    return () => window.removeEventListener("unfold:locale-changed", onLocaleChange);
  }, []);

  const navItems = [
    {
      key: "timeline" as const,
      href: "/demo/timeline",
      icon: Clock,
      label: t("nav.timeline", locale),
    },
    {
      key: "match" as const,
      href: "/demo/compatibility",
      icon: Heart,
      label: t("nav.match", locale),
      badge: connectionCount,
    },
  ];

  return (
    <nav className="flex items-center justify-around pb-2" style={{
      height: 56,
      background: "var(--glass-bg)",
      border: "none",
      borderTop: "1px solid var(--glass-border)",
      backdropFilter: "blur(var(--glass-blur))",
    }}>
      {navItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
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
