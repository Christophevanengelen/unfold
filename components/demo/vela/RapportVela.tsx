"use client";

/**
 * La reponse de Vela, dessinee.
 *
 * ─── POURQUOI CE BLOC EXISTE ────────────────────────────────────────────────
 *
 * Christophe, le 16/09 : « une fois la problematique saisie et les donnees
 * recuperees, je veux un rapport de qualite, graphique, storytelling et
 * illustration ». Jusqu ici Vela rendait quatre paragraphes titres. Les mots
 * restent — ce sont eux qui repondent —, mais ce qui a ete MESURE se voit
 * maintenant : le domaine touche, la fenetre de dates, et combien de techniques
 * se rejoignent dessus.
 *
 * ─── CE QU ON REFUSE DE DESSINER ────────────────────────────────────────────
 *
 * Un pourcentage. Le moteur ne rend pas de score ici : `force` est un NOMBRE DE
 * TECHNIQUES qui concordent (lib/silence.ts, `force: participants.length`). Le
 * transformer en « 78 % de fiabilite » serait fabriquer une precision qui
 * n existe pas — exactement le reproche fait aux rapports generes du marche.
 * On montre donc des jetons qu on peut compter : trois techniques font trois
 * jetons.
 *
 * ─── LA FRISE ───────────────────────────────────────────────────────────────
 *
 * La seule forme temporelle qui reste dans le produit apres l abandon du
 * timing, et elle reste parce qu elle est le sujet meme de la question posee :
 * quand. Un segment, un reperage d aujourd hui dedans. Si le moteur dit que la
 * fenetre est approchee, la frise le dit aussi — une date approchee s affiche
 * comme approchee, jamais comme une date nette.
 */

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { DOMAINE } from "@/lib/score-match";
import { STRINGS_MATCH_DOMAINES, t, type Locale } from "@/lib/i18n-demo";

/**
 * Deux formes, parce que le moteur repond de deux facons differentes et qu on
 * refuse de faire passer l une pour l autre.
 *
 *  - `fenetre` : une question sur une periode. Il y a un domaine, des dates, et
 *    un nombre de techniques qui concordent. On dessine une frise.
 *  - `signaux` : une question au present. Il n y a PAS de periode — seulement
 *    une liste de choses actives, deja classees par le moteur. Dessiner une
 *    frise ici inventerait des dates. On dessine donc un classement.
 */
export type VisuelVela =
  | {
      forme: "fenetre";
      maison: number;
      force: number;
      debut: string;
      fin: string;
      approximee: boolean;
    }
  | { forme: "signaux"; priorites: number[] };

/** Vrai si le champ a bien l une des deux formes. Un contrat additif se verifie. */
export function estVisuelVela(v: unknown): v is VisuelVela {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  if (o.forme === "signaux") {
    return Array.isArray(o.priorites) && o.priorites.every((x) => typeof x === "number");
  }
  return (
    o.forme === "fenetre" &&
    typeof o.maison === "number" &&
    typeof o.force === "number" &&
    typeof o.debut === "string" &&
    typeof o.fin === "string"
  );
}

const COURBE = [0.16, 1, 0.3, 1] as const;

function jour(iso: string): Date | null {
  const d = new Date(`${iso}T12:00:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function moisCourt(d: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
}

export function RapportVela({ visuel, locale }: { visuel: VisuelVela; locale: Locale }) {
  return visuel.forme === "signaux" ? (
    <Signaux priorites={visuel.priorites} locale={locale} />
  ) : (
    <Fenetre visuel={visuel} locale={locale} />
  );
}

/**
 * Le classement des choses actives. Une barre par signal, du plus prioritaire
 * au moins prioritaire, normalisee sur le plus fort du lot — c est un RANG, pas
 * une mesure sur cent, et le dessin ne doit pas laisser croire l inverse : pas
 * de chiffre affiche, pas d axe, pas d echelle.
 */
function Signaux({ priorites, locale }: { priorites: number[]; locale: Locale }) {
  const fige = useReducedMotion();
  const ordre = [...priorites].sort((a, b) => b - a);
  const haut = Math.max(...ordre, 1);
  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-secondary)" }}>
      <p className="text-[11px] leading-snug text-text-body-subtle">
        {t(ordre.length === 1 ? "rapport.vela_actif_un" : "rapport.vela_actif_n", locale).replace(
          "{n}",
          String(ordre.length),
        )}
      </p>
      <div className="mt-2.5 space-y-1.5" role="img" aria-label={t("rapport.vela_actif_n", locale).replace("{n}", String(ordre.length))}>
        {ordre.map((p, i) => (
          <div
            key={i}
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--surface-medium)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: "var(--accent-purple)", opacity: 1 - i * 0.22 }}
              initial={{ width: fige ? `${(p / haut) * 100}%` : 0 }}
              animate={{ width: `${(p / haut) * 100}%` }}
              transition={{ duration: fige ? 0 : 0.7, delay: fige ? 0 : 0.15 * i, ease: COURBE }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function Fenetre({
  visuel,
  locale,
}: {
  visuel: Extract<VisuelVela, { forme: "fenetre" }>;
  locale: Locale;
}) {
  const fige = useReducedMotion();
  const debut = jour(visuel.debut);
  const fin = jour(visuel.fin);
  const cleDomaine = DOMAINE[visuel.maison];
  const domaine = cleDomaine ? STRINGS_MATCH_DOMAINES(locale)[cleDomaine] : null;

  // L heure est lue une seule fois, a la creation de la bulle. Deux raisons :
  // le rendu de React doit rester pur — `Date.now()` dans le corps rend le
  // meme composant different a chaque passage —, et un marqueur qui glisserait
  // pendant qu on lit n aurait aucun sens sur une fenetre longue de plusieurs
  // semaines.
  const [maintenant] = useState(() => Date.now());

  // Ou se trouve aujourd hui dans la fenetre. Hors fenetre, pas de marqueur :
  // un marqueur colle au bord mentirait sur la position.
  let position: number | null = null;
  if (debut && fin && fin > debut) {
    const total = fin.getTime() - debut.getTime();
    const ecoule = maintenant - debut.getTime();
    if (ecoule >= 0 && ecoule <= total) position = (ecoule / total) * 100;
  }

  // Au-dela de cinq, on arrete de dessiner des jetons et on ecrit le nombre :
  // douze jetons ne se comptent plus d un coup d oeil.
  const jetons = Math.max(1, Math.min(5, Math.round(visuel.force)));
  const enChiffres = visuel.force > 5;

  return (
    <div className="rounded-2xl p-4" style={{ background: "var(--bg-secondary)" }}>
      {domaine ? (
        <span
          className="inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold"
          style={{ background: "var(--surface-medium)", color: "var(--text-heading)" }}
        >
          {domaine}
        </span>
      ) : null}

      {debut && fin ? (
        <div className="mt-3.5">
          <div className="flex items-baseline justify-between text-[11px] font-semibold text-text-body-subtle">
            <span>{moisCourt(debut, locale)}</span>
            <span>{moisCourt(fin, locale)}</span>
          </div>
          <div
            className="relative mt-1.5 h-2 w-full overflow-hidden rounded-full"
            role="img"
            aria-label={`${moisCourt(debut, locale)} — ${moisCourt(fin, locale)}`}
            style={{ background: "var(--surface-medium)" }}
          >
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{
                background: "var(--accent-purple)",
                // Une fenetre approchee se dessine en degrade : les bords
                // s eteignent au lieu de trancher.
                opacity: visuel.approximee ? 0.55 : 1,
              }}
              initial={{ width: fige ? "100%" : 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: fige ? 0 : 0.9, ease: COURBE }}
            />
            {position !== null ? (
              <span
                className="absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-full"
                style={{ left: `calc(${position}% - 2px)`, background: "var(--text-heading)" }}
                aria-hidden="true"
              />
            ) : null}
          </div>
          {visuel.approximee ? (
            <p className="mt-1.5 text-[11px] leading-snug text-text-body-subtle">
              {t("rapport.vela_approche", locale)}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3.5 flex items-center gap-2">
        {enChiffres ? (
          <span className="text-[13px] font-semibold tabular-nums text-text-heading">
            {visuel.force}
          </span>
        ) : (
          <span className="flex gap-1" aria-hidden="true">
            {Array.from({ length: jetons }, (_, i) => (
              <motion.span
                key={i}
                className="block h-2 w-2 rounded-full"
                style={{ background: "var(--accent-purple)" }}
                initial={fige ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: fige ? 0 : 0.3, delay: fige ? 0 : 0.5 + i * 0.09, ease: COURBE }}
              />
            ))}
          </span>
        )}
        <span className="text-[11px] leading-snug text-text-body-subtle">
          {t(visuel.force === 1 ? "rapport.vela_force_un" : "rapport.vela_force_n", locale).replace(
            "{n}",
            String(visuel.force),
          )}
        </span>
      </div>
    </div>
  );
}
