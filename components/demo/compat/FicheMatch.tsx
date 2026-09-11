"use client";

/**
 * La fiche de compatibilité : un chiffre, quatre axes, deux colonnes.
 *
 * L ordre de lecture suit ce que Christophe a demandé : le score d abord, parce
 * que c est ce qu on vient chercher et ce qu on partage ; les axes ensuite,
 * parce qu un chiffre seul ne se comprend pas ; ce qui rassemble et ce qui
 * complète ; et le moment tout en bas, seulement s il se détache — c est une
 * indication, plus le sujet.
 *
 * Trois règles de dessin, chacune tirée de la veille du 11/09 :
 *
 *  - Les quatre axes ne s additionnent jamais et ne s empilent jamais dans une
 *    même barre. Sanctuary additionne ses six axes en un total ; Cafe Astrology,
 *    qui publie pourtant un barème, écrit qu il a toujours sauté les feuilles de
 *    score. On montre les quatre, on n en fait pas une somme.
 *  - Aucune couleur de jugement. Pas de vert « compatible », pas de rouge
 *    « incompatible » : ce verdict n existe pas ici. L accent de l app porte
 *    toutes les barres, quelle que soit leur valeur.
 *  - Une phrase de garde en bas, toujours visible : un lien exigeant n est pas
 *    un lien raté. C est ce que The Pattern met en première phrase de sa
 *    catégorie la plus basse, et c est ce qui manque à tous les autres.
 */

import { motion, useReducedMotion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";
import { DOMAINE, type Axe, type FicheCompatibilite } from "@/lib/score-match";

function nomDomaine(d: number, locale: Locale): string {
  const cle = DOMAINE[d];
  if (!cle) return "";
  return STRINGS_MATCH_DOMAINES(locale)[cle] ?? "";
}

function LigneAxe({
  axe,
  titre,
  aide,
  locale,
  delai,
}: {
  axe: Axe;
  titre: string;
  aide: string;
  locale: Locale;
  delai: number;
}) {
  const sansMouvement = useReducedMotion();
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-semibold text-text-heading">{titre}</span>
        <span className="shrink-0 text-[11px] font-semibold text-text-body-subtle">
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
          transition={{
            duration: sansMouvement ? 0 : 0.8,
            delay: sansMouvement ? 0 : delai,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
      <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">{aide}</p>
    </div>
  );
}

function Colonne({ titre, domaines, locale }: { titre: string; domaines: number[]; locale: Locale }) {
  return (
    <div className="min-w-0 flex-1 rounded-xl px-3 py-2.5" style={{ background: "var(--bg-secondary)" }}>
      <EyebrowLabel color="var(--text-body-subtle)" className="mb-1">
        {titre}
      </EyebrowLabel>
      <p className="text-[12px] leading-snug text-text-body">
        {domaines.length > 0 ? domaines.map((d) => nomDomaine(d, locale)).join(", ") : "—"}
      </p>
    </div>
  );
}

export function FicheMatch({
  fiche,
  locale,
  exemple,
  nomAutre,
}: {
  fiche: FicheCompatibilite;
  locale: Locale;
  /** Un exemple se dit. Le produit ne présente jamais un exemple comme une lecture. */
  exemple?: boolean;
  nomAutre?: string;
}) {
  const sansMouvement = useReducedMotion();

  return (
    <section
      className="rounded-2xl px-4 py-4"
      style={{ background: "var(--surface-light)" }}
      aria-label={t("match.score_titre", locale)}
    >
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

      {/* Le score. Il est gros parce que c est ce qu on vient chercher — et il
          est suivi, dans la même respiration, de ce sur quoi il porte. */}
      <div className="mt-3 flex items-end gap-3">
        <motion.span
          className="text-[52px] font-bold leading-none tabular-nums"
          style={{ color: "var(--accent-purple)" }}
          initial={{ opacity: sansMouvement ? 1 : 0, y: sansMouvement ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: sansMouvement ? 0 : 0.45 }}
        >
          {fiche.score}
          <span className="text-[24px]"> %</span>
        </motion.span>
        <div className="min-w-0 flex-1 pb-1.5">
          <p className="text-[14px] font-semibold leading-tight text-text-heading">
            {t("match.score_titre", locale)}
          </p>
        </div>
      </div>
      <p className="mt-1.5 text-[11px] leading-snug text-text-body-subtle">
        {t("match.score_aide", locale)}
      </p>

      <div className="mt-4 space-y-3.5">
        <LigneAxe axe={fiche.terrain} titre={t("match.terrain", locale)} aide={t("match.terrain_aide", locale)} locale={locale} delai={0.05} />
        <LigneAxe axe={fiche.climat} titre={t("match.climat", locale)} aide={t("match.climat_aide", locale)} locale={locale} delai={0.12} />
        <LigneAxe axe={fiche.equilibre} titre={t("match.equilibre", locale)} aide={t("match.equilibre_aide", locale)} locale={locale} delai={0.19} />
        <LigneAxe axe={fiche.rythme} titre={t("match.rythme", locale)} aide={t("match.rythme_aide", locale)} locale={locale} delai={0.26} />
      </div>

      {fiche.rassemble.length > 0 && (
        <div className="mt-4">
          <EyebrowLabel color="var(--text-body-subtle)" className="mb-1">
            {t("match.rassemble", locale)}
          </EyebrowLabel>
          <p className="text-[13px] leading-snug text-text-heading">
            {fiche.rassemble.map((d) => nomDomaine(d, locale)).join(" · ")}
          </p>
        </div>
      )}

      {/* La complémentarité : ce que chacun porte sans l autre. Deux colonnes,
          parce que ce n est pas la même chose des deux côtés. */}
      {(fiche.toiSeul.length > 0 || fiche.autreSeul.length > 0) && (
        <div className="mt-3">
          <EyebrowLabel color="var(--text-body-subtle)" className="mb-1.5">
            {t("match.complete", locale)}
          </EyebrowLabel>
          <div className="flex gap-2">
            <Colonne titre={t("match.toi_seul", locale)} domaines={fiche.toiSeul} locale={locale} />
            <Colonne
              titre={nomAutre ?? t("match.autre_seul", locale)}
              domaines={fiche.autreSeul}
              locale={locale}
            />
          </div>
        </div>
      )}

      {/* Le moment, seulement s il se détache nettement. Sinon cette ligne
          n existe pas : une « meilleure période » qui n en est pas une serait
          une invention. */}
      {fiche.moment && (
        <p className="mt-3 text-[12px] leading-snug text-text-body">
          <span className="font-semibold text-text-heading">{t("match.moment", locale)}</span>{" "}
          {new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(
            new Date(`${fiche.moment.mois}-01T00:00:00Z`),
          )}
          {fiche.moment.domaines.length > 0 && ` · ${nomDomaine(fiche.moment.domaines[0], locale)}`}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-snug text-text-body-subtle">
        {t("match.pas_verdict", locale)}
      </p>
    </section>
  );
}
