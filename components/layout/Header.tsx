import Image from "next/image";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border-muted bg-bg-primary/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <Image
            src="/logo/logo-dark.svg"
            alt="Unfold"
            width={120}
            height={28}
            className="block dark:hidden"
            priority
          />
          <Image
            src="/logo/logo-light.svg"
            alt="Unfold"
            width={120}
            height={28}
            className="hidden dark:block"
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher currentLocale={locale} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
