import Image from "next/image";
import Link from "next/link";

interface FooterProps {
  locale: string;
}

const footerLabels: Record<string, {
  product: string;
  legal: string;
  pricing: string;
  demo: string;
  privacy: string;
  terms: string;
  contact: string;
  rights: string;
}> = {
  en: {
    product: "Product",
    legal: "Legal",
    pricing: "Pricing",
    demo: "Try the demo",
    privacy: "Privacy Policy",
    terms: "Terms of Service",
    contact: "Contact",
    rights: "All rights reserved.",
  },
  fr: {
    product: "Produit",
    legal: "L\u00e9gal",
    pricing: "Tarifs",
    demo: "Essayer la d\u00e9mo",
    privacy: "Confidentialit\u00e9",
    terms: "Conditions d\u2019utilisation",
    contact: "Contact",
    rights: "Tous droits r\u00e9serv\u00e9s.",
  },
  es: {
    product: "Producto",
    legal: "Legal",
    pricing: "Precios",
    demo: "Probar la demo",
    privacy: "Privacidad",
    terms: "T\u00e9rminos de Servicio",
    contact: "Contacto",
    rights: "Todos los derechos reservados.",
  },
};

export function Footer({ locale }: FooterProps) {
  const l = footerLabels[locale] ?? footerLabels.en;

  return (
    <footer className="border-t border-white/5" style={{ backgroundColor: "var(--bg-primary, #1B1535)" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3 md:gap-16">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href={`/${locale}`} className="flex items-center gap-3">
              <Image
                src="/logo/icon-mark.svg"
                alt=""
                width={28}
                height={28}
              />
              <span
                className="font-display text-lg font-normal text-brand-11"
                style={{ letterSpacing: "0.2em" }}
              >
                unfold
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-brand-10">
              {locale === "fr"
                ? "Votre timing personnel, d\u00e9cod\u00e9."
                : locale === "es"
                  ? "Tu timing personal, decodificado."
                  : "Your personal timing, decoded."}
            </p>
          </div>

          {/* Product links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-10">
              {l.product}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}#pricing`}
                  className="text-sm text-brand-11 transition-colors hover:text-white"
                >
                  {l.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="text-sm text-brand-11 transition-colors hover:text-white"
                >
                  {l.demo}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-10">
              {l.legal}
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href={`/${locale}/privacy`}
                  className="text-sm text-brand-11 transition-colors hover:text-white"
                >
                  {l.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${locale}/terms`}
                  className="text-sm text-brand-11 transition-colors hover:text-white"
                >
                  {l.terms}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@unfold.app"
                  className="text-sm text-brand-11 transition-colors hover:text-white"
                >
                  {l.contact}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/5 pt-6">
          <p className="text-center text-xs text-brand-10">
            &copy; {new Date().getFullYear()} Unfold. {l.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}
