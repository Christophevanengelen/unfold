"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/demo", label: "Today" },
  { href: "/demo/yesterday", label: "Yesterday" },
  { href: "/demo/tomorrow", label: "Tomorrow" },
  { href: "/demo/compatibility", label: "Match" },
  { href: "/demo/premium", label: "Premium" },
];

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-3 p-4">
      {/* Mobile frame */}
      <div className="flex h-[812px] w-[375px] flex-col overflow-hidden rounded-[2.5rem] border-4 border-brand-10 bg-bg-primary shadow-2xl">
        {/* Status bar */}
        <div className="flex items-center justify-between px-6 pt-3 pb-1">
          <span className="text-xs font-medium text-text-body-subtle">9:41</span>
          <span className="font-display text-sm font-bold text-accent-purple">Unfold</span>
          <span className="text-xs text-text-body-subtle">Demo</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Tab bar */}
        <nav className="flex border-t border-border-light bg-bg-secondary/80 backdrop-blur-sm">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/demo"
                ? pathname === "/demo"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex-1 py-3 text-center text-xs font-medium transition-colors ${
                  isActive
                    ? "text-accent-purple"
                    : "text-text-body-subtle hover:text-text-body"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
