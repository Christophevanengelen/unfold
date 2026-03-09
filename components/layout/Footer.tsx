import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-border-muted bg-bg-secondary">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-8">
          <Link href={`/${locale}`}>
            <Image
              src="/logo/logo-dark.svg"
              alt="Unfold"
              width={100}
              height={23}
              className="block dark:hidden"
            />
            <Image
              src="/logo/logo-light.svg"
              alt="Unfold"
              width={100}
              height={23}
              className="hidden dark:block"
            />
          </Link>
          <p className="text-center text-sm text-text-body-subtle">
            &copy; {new Date().getFullYear()} Unfold. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
