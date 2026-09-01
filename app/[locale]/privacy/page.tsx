// Le layout racine lit headers() pour connaitre la langue, ce qui force le
// rendu dynamique. Sans cette ligne, Next tente un rendu statique, tombe sur
// headers(), et renvoie DYNAMIC_SERVER_USAGE — une erreur 500.
//
// Les pages /pricing et la page d accueil localisee la portent depuis un
// commit intitule « force-dynamic on locale pages ». Ces deux-ci avaient ete
// oubliees, et sont restees en 500 du 30 juillet au 31 aout 2026 : un mois,
// sur les deux URL qu Apple exige de pouvoir ouvrir.
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { privacyPolicy } from "@/lib/legal-content";

/**
 * Requis par output: "export" (build natif). Sur le web, on renvoie une liste
 * vide : les pages restent rendues a la demande, rien ne change.
 */
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
  const doc = privacyPolicy[locale] ?? privacyPolicy.en;
  return {
    title: `${doc.title} — Favorable`,
    description: "How Favorable collects, uses, and protects your personal information.",
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = privacyPolicy[locale] ?? privacyPolicy.en;

  return (
    <LegalPage title={doc.title} lastUpdated={doc.lastUpdated}>
      {doc.intro.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
      {doc.sections.map((section, i) => (
        <div key={i}>
          <h2 className="mt-10 font-display text-xl font-semibold text-white">
            {section.heading}
          </h2>
          {section.paragraphs.map((p, j) => (
            <p key={j} className="mt-3">
              {p}
            </p>
          ))}
        </div>
      ))}
    </LegalPage>
  );
}
