"use client";

/**
 * Le resume d une vie — la meme carte, une autre echelle.
 *
 * Christophe, le 17/09 : « pareil pour le resume important de toute une vie ».
 *
 * ─── LA FRISE ───────────────────────────────────────────────────────────────
 *
 * Une colonne par annee vecue, haute comme le nombre de periodes ouvertes
 * cette annee-la. C est la seule facon honnete de montrer une vie entiere sur
 * une largeur de telephone : on ne resume pas, on compte.
 *
 * L annee en cours porte la seule marque vive. Les chapitres — les tres
 * longues periodes que le moteur marque lui-meme — se lisent dessous, avec
 * l age auquel ils ont commence.
 *
 * ─── CE QU ON NE DIT PAS ────────────────────────────────────────────────────
 *
 * « Ta meilleure decennie », « une annee difficile », « un tournant a venir ».
 * Rien de tout cela n est dans la donnee, et une vie resumee en chiffres invite
 * a la prophetie. On ecrit « l annee la plus chargee » — un compte — et jamais
 * « la plus dure », qui serait un jugement qu aucune mesure ne porte.
 */

import { motion, useReducedMotion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";
import { DOMAINE } from "@/lib/score-match";
import { CASCADE, ENTREE } from "@/lib/ressorts";
import type { ResumeDeVie } from "@/lib/resume-vie";
import type { MomentumPhase } from "@/types/momentum";
import { Signature } from "./Signature";

function domaine(phase: MomentumPhase, locale: Locale): string | null {
  const clef = phase.house ? DOMAINE[phase.house] : undefined;
  return clef ? (STRINGS_MATCH_DOMAINES(locale)[clef] ?? null) : null;
}

function remplir(modele: string, valeurs: Record<string, string | number>): string {
  return modele.replace(/\{(\w+)\}/g, (_, c: string) => String(valeurs[c] ?? `{${c}}`));
}

/** La frise : une vie, d un seul trait. */
function Frise({ resume, locale }: { resume: ResumeDeVie; locale: Locale }) {
  const fige = useReducedMotion();

  /**
   * On ne dessine QUE ce que le moteur documente.
   *
   * Mesure du 17/09 : sur un jeu de donnees qui ne couvrait que l annee en
   * cours, la frise affichait quarante colonnes vides et une barre. Elle
   * laissait donc croire a quarante annees ou il ne s etait rien passe — alors
   * qu il s agit d annees que le calcul ne couvre pas. C est une donnee
   * fabriquee par omission, exactement ce que le produit s interdit.
   */
  const depart = resume.premiereDocumentee ?? 0;
  const annees = resume.annees.slice(depart);
  const haut = Math.max(1, ...annees.map((a) => a.periodes));

  return (
    <div>
      <div
        className="flex h-24 items-end gap-[2px]"
        role="img"
        aria-label={t("resume.vie_legende", locale)}
      >
        {annees.map((a) => {
          const courante = a.age === resume.age;
          return (
            <motion.span
              key={a.age}
              // Un nom, pour que le parcours puisse compter les colonnes sans
              // attraper tous les `span` de la page — c est ce qui faisait
              // passer un test qui aurait du echouer.
              data-frise={a.periodes}
              className="min-w-0 flex-1 rounded-sm"
              style={{
                background: courante ? "var(--text-heading)" : "var(--accent-purple)",
                opacity: courante ? 1 : 0.28 + (a.periodes / haut) * 0.5,
              }}
              initial={{ height: fige ? `${Math.max(4, (a.periodes / haut) * 100)}%` : 0 }}
              whileInView={{ height: `${Math.max(4, (a.periodes / haut) * 100)}%` }}
              viewport={{ once: true, amount: 0.4 }}
              transition={
                fige
                  ? { duration: 0 }
                  : { duration: 0.5, delay: Math.min(0.5, a.age * 0.008), ease: [0.16, 1, 0.3, 1] }
              }
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] tabular-nums text-text-body-subtle">
        <span>{depart}</span>
        <span>{remplir(t("resume.vie_ans", locale), { n: resume.age })}</span>
      </div>
    </div>
  );
}

export function ResumeVie({
  resume,
  naissance,
  locale,
}: {
  resume: ResumeDeVie;
  naissance: string;
  locale: Locale;
}) {
  const fige = useReducedMotion();
  if (resume.vide) return null;

  const chapitres = resume.chapitres.slice(-4);

  return (
    <div
      className="grain lisere relative overflow-hidden rounded-3xl px-5 pb-6 pt-6"
      style={{ background: "var(--bg-secondary)" }}
    >
      <Signature
        naissance={naissance}
        taille={320}
        opacite={0.14}
        className="pointer-events-none absolute -left-20 -top-16"
      />

      <div className="relative">
        <EyebrowLabel color="var(--text-body-subtle)">{t("resume.vie_eyebrow", locale)}</EyebrowLabel>

        <motion.p
          className="mt-2.5 text-[26px] leading-[1.12]"
          style={{
            fontFamily: "var(--font-titre)",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            color: "var(--text-heading)",
            textWrap: "balance",
          }}
          initial={fige ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={ENTREE}
        >
          {remplir(t("resume.vie_titre", locale), { n: resume.total, age: resume.age })}
        </motion.p>

        <div className="mt-5">
          <Frise resume={resume} locale={locale} />
        </div>

        {/* Les chapitres : les tres longues periodes, avec l age de leur debut. */}
        {chapitres.length > 0 ? (
          <div className="mt-5 space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-body-subtle">
              {t("resume.vie_chapitres", locale)}
            </p>
            {chapitres.map((c, i) => (
              <motion.div
                key={c.phase.id}
                className="flex items-baseline justify-between gap-3"
                initial={fige ? false : { opacity: 0, x: -6 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ ...ENTREE, delay: CASCADE * i }}
              >
                <span
                  className={`min-w-0 truncate text-[13px] ${c.encours ? "font-semibold text-text-heading" : "text-text-body"}`}
                >
                  {domaine(c.phase, locale) ?? c.phase.title}
                </span>
                <span className="shrink-0 text-[11px] tabular-nums text-text-body-subtle">
                  {c.ageFin === null
                    ? remplir(t("resume.vie_depuis_age", locale), { a: c.ageDebut })
                    : `${c.ageDebut} – ${c.ageFin}`}
                </span>
              </motion.div>
            ))}
          </div>
        ) : null}

        <div
          className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t pt-3.5 text-[11px] leading-snug text-text-body-subtle"
          style={{ borderColor: "var(--border-base)" }}
        >
          {resume.pointHaut ? (
            <span>
              {remplir(t("resume.vie_plus_charge", locale), {
                a: resume.pointHaut.age,
                n: resume.pointHaut.periodes,
              })}
            </span>
          ) : null}
          {resume.bascules.length > 0 ? (
            <span>
              {remplir(
                t(resume.bascules.length <= 1 ? "resume.vie_bascules_un" : "resume.vie_bascules_n", locale),
                { n: resume.bascules.length },
              )}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
