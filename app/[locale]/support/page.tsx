// Meme raison que /privacy et /terms : le layout racine lit headers() pour
// connaitre la langue, ce qui force le rendu dynamique. Sans cette ligne, la
// page renverrait 500 — c est exactement ce qui est arrive aux deux autres
// pendant un mois entier.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { supportContent, CONTACT } from "@/lib/support-content";

/** Requis par output: "export" pour le build natif. */
export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_NATIVE !== "true") return [];
  return [{ locale: "fr" }, { locale: "en" }, { locale: "es" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = supportContent[locale] ?? supportContent.en;
  return {
    title: `${doc.title} — Favorable`,
    description: doc.intro,
  };
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = supportContent[locale] ?? supportContent.en;
  const langue = supportContent[locale] ? locale : "en";

  return (
    <LegalPage title={doc.title} lastUpdated={doc.intro}>
      {doc.sections.map((section, i) => (
        <div key={i}>
          <h2 className="mt-10 font-display text-xl font-semibold text-white">
            {section.heading}
          </h2>
          {section.body.map((p, j) => (
            <p key={j} className="mt-3">
              {/* L adresse devient cliquable partout ou elle apparait, sans
                  avoir a la dupliquer dans le contenu. */}
              {p.includes(CONTACT) ? (
                <>
                  <a href={`mailto:${CONTACT}`} className="underline">
                    {CONTACT}
                  </a>
                  {p.slice(p.indexOf(CONTACT) + CONTACT.length)}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
      ))}

      <div className="mt-12 flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-6 text-sm">
        <Link href={`/${langue}/privacy`} className="underline">
          {langue === "fr" ? "Confidentialité" : langue === "es" ? "Privacidad" : "Privacy"}
        </Link>
        <Link href={`/${langue}/terms`} className="underline">
          {langue === "fr" ? "Conditions" : langue === "es" ? "Términos" : "Terms"}
        </Link>
      </div>
    </LegalPage>
  );
}
