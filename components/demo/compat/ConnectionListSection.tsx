"use client";

import type { ReactNode } from "react";

interface ConnectionListSectionProps {
  title: string;
  count: number;
  subtle?: boolean;
  children: ReactNode;
}

/**
 * Section header + children wrapper for the rhythm inbox.
 * Sections: "Actif maintenant" / "Bientôt" / "Calme".
 */
export function ConnectionListSection({
  title,
  count,
  subtle,
  children,
}: ConnectionListSectionProps) {
  if (count === 0) return null;
  return (
    <section className="mt-5 first:mt-4">
      <header className="mb-2 flex items-center justify-between px-1">
        <h2
          className="text-[10px] font-semibold uppercase tracking-widest"
          style={{
            color: subtle ? "var(--text-body-subtle)" : "var(--text-heading)",
            opacity: subtle ? 0.7 : 1,
          }}
        >
          {title}
        </h2>
        <span className="text-[10px] text-text-body-subtle">{count}</span>
      </header>
      <div className={subtle ? "space-y-2 opacity-85" : "space-y-2"}>{children}</div>
    </section>
  );
}
