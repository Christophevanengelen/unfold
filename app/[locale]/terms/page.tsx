import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { termsOfService } from "@/lib/legal-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const doc = termsOfService[locale] ?? termsOfService.en;
  return {
    title: `${doc.title} — Unfold`,
    description: "Terms of Service for using the Unfold personal timing application.",
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const doc = termsOfService[locale] ?? termsOfService.en;

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
