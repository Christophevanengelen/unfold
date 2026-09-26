import { AppStoreBadges, APP_PUBLIEE } from "./AppStoreBadges";
import { ListeDAttente } from "./ListeDAttente";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

interface FinalCTAProps {
  t: (key: string, fallback?: string) => string;
  locale: string;
}

/**
 * Le dernier bloc de la page — et, jusqu au jour de la publication, le seul
 * endroit ou un visiteur peut faire quelque chose.
 *
 * Il disait « Telecharge Favorable · gratuit sur iOS et Android », puis ne
 * montrait rien : `AppStoreBadges` ne rend rien tant que `APP_PUBLIEE` est
 * faux, et l app n est publiee nulle part. Le visiteur qui avait lu toute la
 * page arrivait donc sur une promesse sans porte.
 *
 * Tant que l app n est pas la, le bloc dit la verite et demande la seule
 * chose utile : une adresse. Le jour de la publication, `APP_PUBLIEE` passe a
 * true et les badges reprennent leur place, sans toucher a ce fichier.
 *
 * POURQUOI LE CHAMP EST CONDITIONNE AU SECRET
 *
 * L adresse part vers le CRM central, derriere une signature. Sans
 * `LEADS_INGEST_SECRET`, `app/api/prospect/route.ts` refuse — correctement, en
 * le disant — mais la personne, elle, aurait tape son adresse pour rien. Un
 * champ qui ne peut pas tenir sa promesse est pire que pas de champ : c est
 * exactement la faute qu on repare ici. Ce composant tourne sur le serveur, il
 * peut donc verifier avant d afficher. La variable n est jamais rendue.
 */
export function FinalCTA({ t, locale }: FinalCTAProps) {
  const captureBranchee = Boolean(process.env.LEADS_INGEST_SECRET);
  const listeDAttente = !APP_PUBLIEE && captureBranchee;

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        {/* All CTA content — one cohesive block */}
        <ScrollReveal variant="fadeUp" className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
            {listeDAttente
              ? t("waitlist.title", "Favorable is almost here")
              : t("cta.title", "Download Favorable")}
          </h2>
          <p className="mt-6 text-lg text-brand-10">
            {listeDAttente
              ? t(
                  "waitlist.subtitle",
                  "The app lands on iOS and Android. Leave your address and we'll tell you the day it's out.",
                )
              : t(
                  "cta.subtitle",
                  "Your personal signal, decoded. See your momentum — past, present, and next. Free on iOS and Android.",
                )}
          </p>
          <div className="mt-10">
            {listeDAttente ? <ListeDAttente t={t} locale={locale} /> : <AppStoreBadges />}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
