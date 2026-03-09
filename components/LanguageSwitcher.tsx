"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { useState, useRef, useEffect } from "react";

interface LanguageSwitcherProps {
  currentLocale: string;
}

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(locale: Locale) {
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/"));
    setOpen(false);
  }

  const current = locales.find((l) => l.code === currentLocale);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full border border-border-light bg-bg-secondary px-3 py-1.5 text-sm font-medium text-text-body transition-colors hover:bg-bg-brand-soft"
      >
        {current?.code.toUpperCase()}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-border-light bg-bg-primary p-1 shadow-lg">
          {locales.map((locale) => (
            <button
              key={locale.code}
              onClick={() => switchLocale(locale.code as Locale)}
              className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                locale.code === currentLocale
                  ? "bg-bg-brand-soft font-medium text-text-brand-strong"
                  : "text-text-body hover:bg-bg-secondary"
              }`}
            >
              <span className="font-medium">{locale.code.toUpperCase()}</span>
              <span className="text-text-body-subtle">{locale.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
