"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/translations", label: "Translations", icon: "🌐" },
  { href: "/admin/content", label: "Content", icon: "📝" },
  { href: "/admin/kpi", label: "KPI Cockpit", icon: "📈" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-border-light bg-bg-secondary">
      <div className="flex h-16 items-center gap-3 border-b border-border-light px-6">
        <span className="font-display text-xl font-bold text-accent-purple">Unfold</span>
        <span className="text-xs text-text-body-subtle">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-bg-brand-soft text-accent-purple"
                  : "text-text-body hover:bg-bg-primary hover:text-text-heading"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border-light p-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-text-body-subtle hover:text-text-body"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
