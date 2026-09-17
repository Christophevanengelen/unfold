"use client";

/**
 * Le resume du jour — une seule carte, tiree des periodes ouvertes.
 *
 * ─── CE QU ELLE REMPLACE ────────────────────────────────────────────────────
 *
 * Deux messages ecrits par un modele a partir des trois signaux les plus forts.
 * Christophe, le 17/09 : « sers-toi des boudins actifs pour en faire un resume
 * important en une seule communication, illustre-la du mieux que tu peux ».
 *
 * ─── CE QU ELLE MONTRE, ET DANS QUEL ORDRE ──────────────────────────────────
 *
 *  1. Ce qui porte la journee — une periode, nommee, en grand.
 *  2. Ou l on en est dedans : une barre, et un repere pour aujourd hui.
 *  3. Tout le reste de ce qui est ouvert, a la meme echelle.
 *  4. Ce qui s ouvre et ce qui se ferme dans le mois.
 *
 * ─── DEUX REGLES DE DESSIN ──────────────────────────────────────────────────
 *
 *  - **Le repere d aujourd hui est la seule marque vive de la carte.** Tout le
 *    reste est en retrait. Une carte ou tout crie ne dit rien.
 *  - **Une periode aux bornes approchees se dessine en degrade.** Le moteur
 *    signale lui-meme quand il n a pas su dater nettement ; l afficher comme
 *    une barre franche serait une promesse qu on n a pas.
 *
 * La signature de la personne est posee en fond. Elle ne se lit pas : c est un
 * monogramme, le meme partout et pour toujours.
 */

import { motion, useReducedMotion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";
import { DOMAINE } from "@/lib/score-match";
import { BARRE, CASCADE } from "@/lib/ressorts";
import type { PeriodeOuverte, ResumeDuJour } from "@/lib/resume-jour";
import type { MomentumPhase } from "@/types/momentum";
import { Signature } from "./Signature";

/** Le moteur ecrit ses domaines en minuscules : on releve la premiere lettre. */
function capitale(t: string): string {
  return t.charAt(0).toLocaleUpperCase() + t.slice(1);
}

function domaine(phase: MomentumPhase, locale: Locale): string | null {
  // La verite est dans la maison, pas dans `domain` (trois valeurs, un
  // rangement). Le mot du moteur d abord, notre traduction ensuite.
  // Les mots du moteur d abord — ils sont plus precis que notre rangement en
  // douze domaines — et notre traduction seulement s il n en donne pas.
  if (phase.houseTopic) return phase.houseTopic;
  const clef = phase.house ? DOMAINE[phase.house] : undefined;
  return clef ? (STRINGS_MATCH_DOMAINES(locale)[clef] ?? null) : null;
}

function remplir(modele: string, valeurs: Record<string, string | number>): string {
  return modele.replace(/\{(\w+)\}/g, (_, c: string) => String(valeurs[c] ?? `{${c}}`));
}

/**
 * Une periode, dessinee comme un segment de temps.
 *
 * La barre entiere est la periode ; la portion pleine est ce qui est deja
 * passe ; le trait vertical est aujourd hui. Trois informations, une forme.
 */
function Segment({
  periode,
  locale,
  delai,
  vedette,
}: {
  periode: PeriodeOuverte;
  locale: Locale;
  delai: number;
  /**
   * La periode qui porte la journee. Son nom est deja le grand titre de la
   * carte : sa barre ne le repete pas — mesure du 17/09, « New foundations »
   * s affichait deux fois a trois lignes d intervalle.
   */
  vedette?: boolean;
}) {
  const fige = useReducedMotion();
  const dom = domaine(periode.phase, locale);
  const part = periode.avancement;

  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-2">
        {vedette ? (
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-body-subtle">
            {t("resume.jour_eyebrow", locale)}
          </span>
        ) : (
          <span className="min-w-0 truncate text-[12px] font-medium text-text-heading">
            {dom ?? periode.phase.title}
          </span>
        )}
        <span className="shrink-0 text-[11px] tabular-nums text-text-body-subtle">
          {periode.restants === null
            ? t("resume.jour_sans_fin", locale)
            : remplir(
                t(periode.restants <= 1 ? "resume.jour_reste_un" : "resume.jour_reste_n", locale),
                { n: periode.restants },
              )}
        </span>
      </div>

      <div
        className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${dom ?? periode.phase.title} — ${Math.round(part ?? 0)} %`}
        style={{ background: "var(--surface-medium)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: "var(--accent-purple)",
            opacity: vedette ? 0.9 : 0.55,
            // Bornes approchees : le bord s eteint au lieu de trancher.
            maskImage: periode.approximee
              ? "linear-gradient(to right, #000 0%, #000 72%, transparent 100%)"
              : undefined,
            WebkitMaskImage: periode.approximee
              ? "linear-gradient(to right, #000 0%, #000 72%, transparent 100%)"
              : undefined,
          }}
          initial={{ width: fige ? `${part ?? 100}%` : 0 }}
          whileInView={{ width: `${part ?? 100}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={fige ? { duration: 0 } : { ...BARRE, delay: delai }}
        />
        {/* Aujourd hui : la seule marque vive de la carte. */}
        {part !== null ? (
          <span
            className="absolute top-1/2 h-3.5 w-[2px] -translate-y-1/2 rounded-full"
            style={{ left: `calc(${part}% - 1px)`, background: "var(--text-heading)" }}
            aria-hidden="true"
          />
        ) : null}
      </div>
    </div>
  );
}

export function ResumeJour({
  resume,
  naissance,
  locale,
}: {
  resume: ResumeDuJour;
  /** Pour la signature de fond. */
  naissance: string;
  locale: Locale;
}) {
  if (resume.aucune) {
    return (
      <div className="rounded-2xl px-5 py-6 text-center" style={{ background: "var(--bg-secondary)" }}>
        <p className="text-[15px] font-semibold text-text-heading">
          {t("resume.jour_rien", locale)}
        </p>
        <p className="mt-1.5 text-[12px] leading-snug text-text-body-subtle">
          {t("resume.jour_rien_aide", locale)}
        </p>
      </div>
    );
  }

  const principale = resume.principale;
  const autres = resume.ouvertes.filter((o) => o !== principale).slice(0, 5);

  return (
    <div
      className="grain lisere relative overflow-hidden rounded-3xl px-5 pb-6 pt-6"
      style={{ background: "var(--bg-secondary)" }}
    >
      <Signature
        naissance={naissance}
        taille={300}
        opacite={0.16}
        className="pointer-events-none absolute -right-16 -top-12"
      />

      <div className="relative">
        <EyebrowLabel color="var(--text-body-subtle)">{t("resume.jour_eyebrow", locale)}</EyebrowLabel>

        {principale ? (
          <>
            <p
              className="mt-2.5 text-[26px] leading-[1.12]"
              style={{
                fontFamily: "var(--font-titre)",
                fontWeight: 300,
                letterSpacing: "-0.02em",
                color: "var(--text-heading)",
                textWrap: "balance",
              }}
            >
              {capitale(domaine(principale.phase, locale) ?? principale.phase.title)}
            </p>
            {/* LA PHRASE DE RARETE, et c est le sujet de la carte.
                « Ca n arrivera qu une fois dans ta vie » est un fait de
                calendrier, verifiable, et c est ce qu une personne a envie de
                lire. Le compte des periodes ouvertes, lui, est de la
                metadonnee : il est descendu tout en bas. */}
            {principale.rarete ? (
              <p
                className="mt-2.5 text-[15px] font-semibold leading-snug"
                style={{ color: principale.rarete.unique ? "var(--text-heading)" : "var(--text-body)" }}
              >
                {principale.rarete.unique
                  ? t("resume.jour_unique", locale)
                  : remplir(t("resume.jour_nieme", locale), {
                      n: principale.rarete.numero,
                      t: principale.rarete.total,
                    })}
              </p>
            ) : null}

            <p className="mt-1.5 text-[12px] leading-snug text-text-body-subtle">
              {remplir(
                t(principale.depuis <= 1 ? "resume.jour_depuis_un" : "resume.jour_depuis_n", locale),
                { n: principale.depuis },
              )}
              {principale.rarete?.ageDerniereFois !== null &&
              principale.rarete?.ageDerniereFois !== undefined
                ? ` ${remplir(t("resume.jour_derniere_fois", locale), {
                    a: principale.rarete.ageDerniereFois,
                  })}`
                : ""}
            </p>

            <div className="mt-4">
              <Segment periode={principale} locale={locale} delai={0} vedette />
            </div>
          </>
        ) : null}

        {autres.length > 0 ? (
          <div className="mt-5 space-y-3.5">
            {autres.map((o, i) => (
              <Segment key={o.phase.id} periode={o} locale={locale} delai={CASCADE * (i + 1)} />
            ))}
          </div>
        ) : null}

        {/* Le compte. Des faits, pas un jugement. */}
        <div
          className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3.5 text-[11px] leading-snug text-text-body-subtle"
          style={{ borderColor: "var(--border-base)" }}
        >
          {/* Le compte ne s affiche que s il y a PLUSIEURS periodes : « 1
              periode ouverte » n apprend rien a personne et occupait la place
              du seul fait qui compte. */}
          {resume.ouvertes.length > 1 ? (
            <span>
              {remplir(t("resume.jour_ouvertes_n", locale), { n: resume.ouvertes.length })}
            </span>
          ) : null}
          {resume.domaines > 1 ? (
            <span>
              {remplir(t("resume.jour_domaines_n", locale), { n: resume.domaines })}
            </span>
          ) : null}
          {resume.bientot.length > 0 ? (
            <span>
              {remplir(
                t(resume.bientot.length <= 1 ? "resume.jour_bientot_un" : "resume.jour_bientot_n", locale),
                { n: resume.bientot.length },
              )}
            </span>
          ) : null}
          {resume.seTermine.length > 0 ? (
            <span>
              {remplir(
                t(resume.seTermine.length <= 1 ? "resume.jour_termine_un" : "resume.jour_termine_n", locale),
                { n: resume.seTermine.length },
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
