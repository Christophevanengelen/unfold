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
    title: `${doc.title} — Unfold`,
    description: "How Unfold collects, uses, and protects your personal information.",
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
