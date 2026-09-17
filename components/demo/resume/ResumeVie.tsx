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
import { avanceeDuChapitre, chapitreCourant, type ChapitreDeVie } from "@/lib/chapitres-vie";
import type { MomentumPhase } from "@/types/momentum";
import { Signature } from "./Signature";
import { BrancheDeVie } from "./BrancheDeVie";

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

/**
 * L arc : une vie entiere en quelques mouvements, a l echelle.
 *
 * La frise au-dessus compte les periodes annee par annee — c est une mesure.
 * L arc dit autre chose : de quoi une vie est FAITE, en trois ou quatre
 * blocs de vingt ou trente ans. Le moteur les calcule depuis toujours ; ils
 * n etaient jamais arrives jusqu ici parce que le point d entree qui les
 * porte pese quatre megaoctets (voir app/api/chapitres).
 *
 * Chaque bloc est large comme sa duree, donc la barre entiere est une vie a
 * l echelle : un chapitre de trente ans occupe deux fois la place d un
 * chapitre de quinze. Le repere vertical marque ou on en est aujourd hui.
 *
 * Le dernier bloc s arrete souvent a l horizon de calcul du moteur et non a sa
 * vraie fin. Dans ce cas on ecrit « a partir de tel age » : on ne ferme pas un
 * chapitre sur une date qu on sait fausse.
 */
function ArcDeVie({
  chapitres,
  locale,
  maintenant,
}: {
  chapitres: ChapitreDeVie[];
  locale: Locale;
  maintenant: number;
}) {
  const fige = useReducedMotion();
  const total = chapitres.reduce((somme, c) => somme + c.annees, 0);
  if (total <= 0) return null;

  const courant = chapitreCourant(chapitres);
  const avancee = avanceeDuChapitre(courant, maintenant);

  // Position du repere sur la barre entiere : les chapitres deja clos, plus la
  // part parcourue de celui en cours.
  let reperePct: number | null = null;
  if (courant && avancee !== null) {
    const avant = chapitres.slice(0, chapitres.indexOf(courant)).reduce((s, c) => s + c.annees, 0);
    reperePct = ((avant + avancee * courant.annees) / total) * 100;
  }

  return (
    <div className="mt-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-body-subtle">
        {t("resume.vie_arc", locale)}
      </p>

      {/* La barre. Chaque segment large comme sa duree. */}
      <div
        className="relative mt-2.5 flex h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--border-base)" }}
        data-arc-total={total}
      >
        {chapitres.map((c, i) => (
          <motion.div
            key={`${c.debut}-${c.maison}`}
            className="h-full"
            style={{
              width: `${(c.annees / total) * 100}%`,
              background: c.encours ? "var(--text-heading)" : "var(--text-body-subtle)",
              opacity: c.encours ? 1 : 0.34,
              borderRight: i < chapitres.length - 1 ? "1.5px solid var(--bg-secondary)" : undefined,
              // Le segment pousse depuis sa gauche. Sans cette origine, `scaleX`
              // le fait grandir depuis son centre et toute la barre se construit
              // en s ecartant du milieu, ce qui ne raconte pas le temps.
              transformOrigin: "left",
            }}
            data-arc-segment={c.maison}
            initial={fige ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ ...ENTREE, delay: CASCADE * i }}
          />
        ))}

        {reperePct !== null ? (
          <div
            className="absolute top-0 h-full"
            style={{
              left: `${reperePct}%`,
              width: 2,
              background: "var(--bg-secondary)",
              boxShadow: "0 0 0 1px var(--text-heading)",
            }}
            data-arc-repere={Math.round(reperePct)}
          />
        ) : null}
      </div>

      {/* Le detail, un mouvement par ligne. */}
      <div className="mt-3 space-y-2">
        {chapitres.map((c, i) => (
          <motion.div
            key={`t-${c.debut}-${c.maison}`}
            className="flex items-baseline justify-between gap-3"
            initial={fige ? false : { opacity: 0, x: -6 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ ...ENTREE, delay: CASCADE * i }}
            data-arc-ligne={c.maison}
          >
            <span
              className={`min-w-0 truncate text-[13px] ${c.encours ? "font-semibold text-text-heading" : "text-text-body"}`}
            >
              {c.domaine}
              {c.encours ? (
                <span className="ml-2 text-[11px] font-normal text-text-body-subtle">
                  {t("resume.vie_arc_encours", locale)}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-[11px] tabular-nums text-text-body-subtle">
              {c.finALHorizon
                ? remplir(t("resume.vie_arc_depuis", locale), { a: c.ageDebut })
                : remplir(t("resume.vie_arc_ages", locale), { a: c.ageDebut, b: c.ageFin })}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ResumeVie({
  resume,
  naissance,
  locale,
  chapitresDeVie,
  maintenant,
}: {
  resume: ResumeDeVie;
  naissance: string;
  locale: Locale;
  /**
   * Les grands mouvements, quand la route allegee a repondu. Absents, l ecran
   * garde exactement ce qu il montrait avant : l arc est un supplement, pas
   * une dependance.
   */
  chapitresDeVie?: ChapitreDeVie[];
  /**
   * L instant de lecture, fige par l appelant.
   *
   * Requis, et pas `Date.now()` en valeur par defaut : lire l horloge pendant
   * le rendu rend le composant impur — deux rendus du meme etat donneraient
   * deux images differentes. La page le fige une fois dans un `useState`.
   */
  maintenant: number;
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

        {/* La branche d abord : c est l image de la vie. La frise juste apres
            donne le compte exact — on regarde, puis on compte. Elle est en
            AJOUT : si le dessin ne rend rien, l ecran reste ce qu il etait. */}
        <div className="mt-4">
          <BrancheDeVie resume={resume} locale={locale} chapitres={chapitresDeVie} />
        </div>

        <div className="mt-5">
          <Frise resume={resume} locale={locale} />
        </div>

        {chapitresDeVie && chapitresDeVie.length > 0 ? (
          <ArcDeVie chapitres={chapitresDeVie} locale={locale} maintenant={maintenant} />
        ) : null}

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
