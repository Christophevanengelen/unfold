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
  signature: string;
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
    signature: "Created and managed by",
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
    signature: "Créé et géré par",
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
    signature: "Creado y gestionado por",
  },
  pt: {
    product: "Produto",
    legal: "Legal",
    pricing: "Preços",
    demo: "Experimentar a demo",
    privacy: "Privacidade",
    terms: "Termos de utilização",
    contact: "Contacto",
    rights: "Todos os direitos reservados.",
    signature: "Criado e gerido por",
  },
  de: {
    product: "Produkt",
    legal: "Rechtliches",
    pricing: "Preise",
    demo: "Demo testen",
    privacy: "Datenschutz",
    terms: "Nutzungsbedingungen",
    contact: "Kontakt",
    rights: "Alle Rechte vorbehalten.",
    signature: "Erstellt und betreut von",
  },
  it: {
    product: "Prodotto",
    legal: "Legale",
    pricing: "Prezzi",
    demo: "Prova la demo",
    privacy: "Privacy",
    terms: "Termini di servizio",
    contact: "Contatti",
    rights: "Tutti i diritti riservati.",
    signature: "Creato e gestito da",
  },
  nl: {
    product: "Product",
    legal: "Juridisch",
    pricing: "Prijzen",
    demo: "Probeer de demo",
    privacy: "Privacy",
    terms: "Gebruiksvoorwaarden",
    contact: "Contact",
    rights: "Alle rechten voorbehouden.",
    signature: "Gemaakt en beheerd door",
  },
  ja: {
    product: "プロダクト",
    legal: "法的事項",
    pricing: "料金",
    demo: "デモを試す",
    privacy: "プライバシー",
    terms: "利用規約",
    contact: "お問い合わせ",
    rights: "全権利所有。",
    signature: "制作・運営",
  },
  zh: {
    product: "产品",
    legal: "法律",
    pricing: "价格",
    demo: "试用演示",
    privacy: "隐私政策",
    terms: "服务条款",
    contact: "联系我们",
    rights: "保留所有权利。",
    signature: "由以下团队创建和管理",
  },
  ar: {
    product: "المنتج",
    legal: "قانوني",
    pricing: "الأسعار",
    demo: "جرّب العرض التجريبي",
    privacy: "الخصوصية",
    terms: "شروط الخدمة",
    contact: "اتصل بنا",
    rights: "جميع الحقوق محفوظة.",
    signature: "أنشئ ويُدار بواسطة",
  },
};

export function Footer({ locale }: FooterProps) {
  const l = footerLabels[locale] ?? footerLabels.en;

  return (
    <footer className="border-t border-white/5" style={{ backgroundColor: "var(--footer-bg, var(--bg-primary, #1B1535))" }}>
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
                favorable
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
                  href="/app"
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
                  href="mailto:hello@hi-def.be"
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
            &copy; {new Date().getFullYear()} Favorable. {l.rights}
          </p>
        </div>
      </div>
      <p className="px-6 pb-8 text-center text-xs text-brand-10">
        {l.signature}{" "}
        <a
          href="https://www.hi-def.be"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          hi-def.be
        </a>
      </p>
    </footer>
  );
}
