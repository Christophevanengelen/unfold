"use client";

import { usePathname } from "next/navigation";

export default function AstroMainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isZr = pathname === "/app/astro/zr" || pathname.startsWith("/app/astro/zr/");

  return (
    <main
      className={
        isZr
          ? "relative z-10 flex h-[calc(100dvh-4.75rem)] min-h-0 w-full flex-col"
          : "relative z-10 mx-auto w-full max-w-2xl px-4 py-6"
      }
    >
      {children}
    </main>
  );
}
