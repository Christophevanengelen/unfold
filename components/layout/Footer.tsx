import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="border-t border-white/5 bg-[#120D24]">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col items-center gap-8">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <Image
              src="/logo/icon-mark.svg"
              alt=""
              width={30}
              height={30}
            />
            <span className="font-display text-xl font-normal text-[#BEB7DD]" style={{ letterSpacing: "0.2em" }}>
              unfold
            </span>
          </Link>
          <p className="text-center text-sm text-[#A8A1C4]">
            &copy; {new Date().getFullYear()} Unfold. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
