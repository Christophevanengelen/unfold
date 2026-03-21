import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 backdrop-blur-xl" style={{ backgroundColor: "color-mix(in srgb, var(--bg-primary, #1B1535) 60%, transparent)" }}>
      <a
        href="#main"
        className="absolute left-4 top-2 -translate-y-full rounded-lg bg-accent-purple px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <Image
            src="/logo/icon-mark.svg"
            alt=""
            width={30}
            height={30}
            priority
          />
          <span className="font-display text-xl font-normal text-brand-11" style={{ letterSpacing: "0.2em" }}>
            unfold
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
