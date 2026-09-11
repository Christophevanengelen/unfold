"use client";

/**
 * La fiche de match : un chiffre, deux axes, et deux lectures.
 *
 * Le dessin suit la regle posee dans `lib/score-match.ts` : le chiffre porte un
 * mois, jamais un jugement sur deux personnes. Trois consequences visuelles.
 *
 *  - Le pourcentage est grand, mais le mois est colle dessous, dans la meme
 *    respiration. On ne peut pas lire l un sans l autre, donc on ne peut pas le
 *    citer hors de son temps.
 *  - L intensite et l aisance sont deux barres SEPAREES, jamais empilees ni
 *    additionnees. Un lien intense et rugueux se voit alors pour ce qu il est :
 *    un lien fort, pas un lien rate. C est l observation de Cafe Astrology,
 *    qu aucun concurrent n a mise a l ecran.
 *  - Les deux colonnes du bas ne sont pas decoratives : ce que A vit n est pas
 *    ce que B vit, et aucun produit du marche n ecrit deux lectures pour un
 *    meme lien.
 *
 * Les couleurs disent l intensite, pas le bien et le mal : on n a pas de vert
 * « compatible » ni de rouge « incompatible », parce que ce jugement n existe
 * pas ici.
 */

import { motion, useReducedMotion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";
import { DOMAINE, type AxeMatch, type FicheMatch as Fiche, type LectureUne } from "@/lib/score-match";

function nomDomaine(d: number, locale: Locale): string {
  const cle = DOMAINE[d];
  if (!cle) return "";
  return STRINGS_MATCH_DOMAINES(locale)[cle] ?? "";
}

function Barre({ axe, titre, aide, locale }: { axe: AxeMatch; titre: string; aide: string; locale: Locale }) {
  const sansMouvement = useReducedMotion();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[12px] font-semibold text-text-heading">{titre}</span>
        <span className="text-[11px] font-semibold tabular-nums text-text-body-subtle">
          {t(`match.${axe.niveau}`, locale)}
        </span>
      </div>
      <div
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full"
        role="img"
        aria-label={`${titre} : ${t(`match.${axe.niveau}`, locale)}`}
        style={{ background: "var(--surface-medium)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: "var(--accent-purple)" }}
          initial={{ width: sansMouvement ? `${axe.valeur}%` : 0 }}
          animate={{ width: `${axe.valeur}%` }}
          transition={{ duration: sansMouvement ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">{aide}</p>
    </div>
  );
}

function Colonne({
  titre,
  lecture,
  locale,
}: {
  titre: string;
  lecture: LectureUne;
  locale: Locale;
}) {
  return (
    <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5" style={{ background: "var(--bg-secondary)" }}>
      <EyebrowLabel color="var(--text-body-subtle)" className="mb-1">
        {titre}
      </EyebrowLabel>
      {lecture.domainesPropres.length > 0 ? (
        <p className="text-[12px] leading-snug text-text-body">
          {lecture.domainesPropres.map((d) => nomDomaine(d, locale)).join(", ")}
        </p>
      ) : (
        <p className="text-[12px] leading-snug text-text-body-subtle">—</p>
      )}
    </div>
  );
}

export function FicheMatch({
  fiche,
  locale,
  exemple,
  nomAutre,
}: {
  fiche: Fiche;
  locale: Locale;
  /** Un exemple se dit. Le produit ne presente jamais un exemple comme une lecture. */
  exemple?: boolean;
  nomAutre?: string;
}) {
  const ecart = t(`match.ecart_${fiche.ecart}`, locale);

  return (
    <section className="rounded-2xl px-4 py-4" style={{ background: "var(--surface-light)" }} aria-label={t("match.titre", locale)}>
      <div className="flex items-center justify-between gap-2">
        <EyebrowLabel color="var(--accent-purple)">{t("match.eyebrow", locale)}</EyebrowLabel>
        {exemple && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{ background: "var(--surface-medium)", color: "var(--text-body-subtle)" }}
          >
            {t("match.exemple", locale)}
          </span>
        )}
      </div>

      {/* Le chiffre et son mois, dans la meme respiration : on ne peut pas
          retenir l un sans l autre. */}
      <div className="mt-3 flex items-end gap-3">
        <span
          className="text-[44px] font-bold leading-none tabular-nums"
          style={{ color: "var(--accent-purple)" }}
        >
          {fiche.terrainCommun}
          <span className="text-[22px]"> %</span>
        </span>
        <div className="min-w-0 flex-1 pb-1">
          <p className="text-[13px] font-semibold leading-tight text-text-heading">
            {t("match.terrain", locale)}
          </p>
          <p className="text-[11px] leading-snug text-text-body-subtle">
            {fiche.mois || t("match.titre", locale)}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-text-body-subtle">
        {t("match.terrain_aide", locale)}
      </p>

      {fiche.communs.length > 0 && (
        <div className="mt-3">
          <EyebrowLabel color="var(--text-body-subtle)" className="mb-1">
            {t("match.communs", locale)}
          </EyebrowLabel>
          <p className="text-[13px] leading-snug text-text-heading">
            {fiche.communs.map((d) => nomDomaine(d, locale)).join(" · ")}
          </p>
        </div>
      )}

      {/* Deux axes separes. Jamais additionnes : leur somme ne veut rien dire. */}
      <div className="mt-4 space-y-3">
        <Barre
          axe={fiche.intensite}
          titre={t("match.intensite", locale)}
          aide={t("match.intensite_aide", locale)}
          locale={locale}
        />
        <Barre
          axe={fiche.aisance}
          titre={t("match.aisance", locale)}
          aide={t("match.aisance_aide", locale)}
          locale={locale}
        />
      </div>

      <div className="mt-4">
        <EyebrowLabel color="var(--text-body-subtle)" className="mb-1">
          {t("match.rythme", locale)}
        </EyebrowLabel>
        <p className="text-[13px] leading-snug text-text-heading">{ecart}</p>
      </div>

      {/* L asymetrie : deux lectures, parce que ce n est pas le meme mois pour
          les deux. */}
      <div className="mt-3 flex gap-2">
        <Colonne titre={t("match.propres_toi", locale)} lecture={fiche.toi} locale={locale} />
        <Colonne
          titre={nomAutre ?? t("match.propres_autre", locale)}
          lecture={fiche.autre}
          locale={locale}
        />
      </div>

      <p className="mt-3 text-[11px] leading-snug text-text-body-subtle">
        {t("match.pas_verdict", locale)}
      </p>
    </section>
  );
}
