"use client";

/**
 * Le ciel d un signal — les planetes rejoignent leur position REELLE.
 *
 * ─── L HISTOIRE DE CE FICHIER, PARCE QU ELLE EXPLIQUE SA FORME ──────────────
 *
 * Premiere version, le 17/09 : un cercle plat, deux points, une corde.
 * Christophe : « ce truc est super moche, je veux l animation et le design de
 * l ecran d onboarding ». Puis : « les petites planetes qui bougent et qui se
 * posent au bon endroit actuel ».
 *
 * Il avait raison. Un cercle avec deux points est un schema de manuel. Ce que
 * l onboarding fait — `components/landing/LoadingNarrator.tsx` — est une figure
 * qu on regarde : des ORBITES ELLIPTIQUES CONCENTRIQUES vues de biais, un
 * centre qui bat, les planetes qui s allument une a une.
 *
 * Ce fichier reprend ce langage, et lui donne ce qui lui manquait : la position
 * n est plus decorative, elle est MESUREE, et la planete y va sous nos yeux.
 *
 * ─── DEUX CHOSES QUE J AI CORRIGEES EN REPRENANT CE LANGAGE ─────────────────
 *
 * 1. **Le centre n est pas le Soleil.** L onboarding l appelle « sun », et il
 *    peut se le permettre : rien n y est mesure. Ici les longitudes que rend le
 *    moteur sont GEOCENTRIQUES — l angle sous lequel on voit la planete depuis
 *    la Terre. Poser un Soleil au centre melangerait deux reperes, et une
 *    figure fausse detruit la credibilite plus surement qu une figure absente.
 *
 *    Le centre est donc l OBSERVATEUR. C est exact, et c est ce que l app
 *    raconte depuis le debut : tout est place par rapport a la personne.
 *
 * 2. **L ordre des anneaux porte une information.** Du plus proche du Soleil au
 *    plus lointain. Un ordre arbitraire aurait ete un ornement de plus.
 *
 * ─── L ANIMATION, ET POURQUOI ELLE N EST PAS UN ORNEMENT ────────────────────
 *
 * Chaque planete part d un point de son orbite et GLISSE LE LONG DE L ELLIPSE
 * jusqu a sa longitude reelle. Elle ne se pose pas : elle y va.
 *
 * C est ce qui fait la difference entre un dessin et une mesure. Une position
 * affichee d emblee se lit comme un emplacement de mise en page ; une position
 * qu on voit ETRE ATTEINTE se lit comme le resultat d un calcul. Le trajet dit
 * « ce point-la, et pas un autre ».
 *
 * Sous « reduire les animations », chaque planete est posee a sa place tout de
 * suite. Rien de ce qui porte du sens ne depend du mouvement.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { planetConfig, getPlanetLabel, type PlanetKey } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n-demo";
import type { Position } from "@/lib/positions-api";

/** Le cadre. Large et bas : c est la perspective qui aplatit les orbites. */
const LARGEUR = 320;
const HAUTEUR = 176;
const CX = LARGEUR / 2;
const CY = HAUTEUR / 2;

/** L ordre reel, du plus proche du Soleil au plus lointain. */
const ORDRE: string[] = [
  "mercury", "venus", "sun", "moon", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

/** Le premier anneau, et l ecart entre deux anneaux. */
const RX0 = 44;
const RY0 = 19;
const PAS_X = 31;
const PAS_Y = 16;

type Ancrage = "start" | "middle" | "end";

/**
 * Un point de l ellipse, a une longitude donnee.
 *
 * Zero a gauche, sens inverse des aiguilles : c est la convention de toute
 * carte du ciel. Quelqu un qui connait ces figures verrait immediatement une
 * carte a l envers.
 */
function versPoint(longitude: number, rx: number, ry: number) {
  const a = ((180 - longitude) * Math.PI) / 180;
  return { x: CX + rx * Math.cos(a), y: CY - ry * Math.sin(a) };
}

function ancrageDe(x: number): Ancrage {
  if (x > CX + 10) return "start";
  if (x < CX - 10) return "end";
  return "middle";
}

/** L ecart angulaire le plus court entre deux longitudes, de 0 a 180. */
export function ecartAngulaire(a: number, b: number): number {
  const d = Math.abs(((a - b) % 360) + 360) % 360;
  return d > 180 ? 360 - d : d;
}

export function CielDuSignal({
  positions,
  locale,
  teinte,
  dateLisible,
}: {
  positions: Position[] | null;
  locale: Locale;
  teinte: string;
  dateLisible: string;
}) {
  const fige = useReducedMotion();

  const astres = useMemo(() => {
    if (!positions) return [];
    return positions
      .map((p) => {
        const clef = p.planete as PlanetKey;
        const meta = planetConfig[clef];
        if (!meta) return null;
        const rang = ORDRE.indexOf(p.planete);
        return { clef, meta, longitude: p.longitude, rang: rang < 0 ? ORDRE.length : rang };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      // Les anneaux se suivent du plus proche au plus lointain. C est l ordre
      // reel du systeme solaire, pas l ordre ou le moteur les a nommes.
      .sort((a, b) => a.rang - b.rang)
      .map((a, i) => {
        const rx = RX0 + i * PAS_X;
        const ry = RY0 + i * PAS_Y;
        const arrivee = versPoint(a.longitude, rx, ry);
        // Le depart : un quart de tour en arriere sur la MEME ellipse. Assez
        // pour que le trajet se voie, assez peu pour qu on ne croie pas a une
        // orbite qui tourne en boucle.
        const depart = versPoint(a.longitude - 90, rx, ry);
        const texte = versPoint(a.longitude, rx + 16, ry + 13);
        return {
          ...a,
          rx,
          ry,
          arrivee,
          depart,
          texte,
          ancrage: ancrageDe(texte.x),
          nom: getPlanetLabel(a.clef, locale) ?? a.meta.label,
        };
      });
  }, [positions, locale]);

  if (astres.length === 0) return null;

  return (
    <figure className="m-0 flex flex-col items-center" data-ciel={astres.length}>
      <svg
        width={LARGEUR}
        height={HAUTEUR}
        viewBox={`0 0 ${LARGEUR} ${HAUTEUR}`}
        aria-hidden="true"
        className="overflow-visible"
      >
        {/* Les orbites. Un filet par astre, dans sa teinte, tres retenu : ce
            sont des reperes de structure, pas le sujet. */}
        {astres.map((a, i) => (
          <motion.ellipse
            key={`o-${a.clef}`}
            cx={CX}
            cy={CY}
            rx={a.rx}
            ry={a.ry}
            fill="none"
            stroke={a.meta.color}
            strokeWidth={0.7}
            initial={fige ? { opacity: 0.32 } : { opacity: 0 }}
            animate={{ opacity: 0.32 }}
            transition={fige ? { duration: 0 } : { duration: 0.5, delay: i * 0.12 }}
          />
        ))}

        {/* Le centre : l observateur. Il bat, lentement — c est le seul
            mouvement qui boucle, et il dit « quelqu un regarde ». */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={3}
          fill="var(--text-heading)"
          animate={fige ? undefined : { opacity: [0.45, 0.9, 0.45] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          style={fige ? { opacity: 0.7 } : undefined}
        />

        {/* Les planetes. Chacune glisse le long de son ellipse jusqu a sa
            longitude mesuree. C est le trajet qui dit « ce point-la ». */}
        {astres.map((a, i) => (
          <g key={a.clef}>
            <motion.circle
              data-planete={a.clef}
              data-longitude={a.longitude.toFixed(2)}
              r={5}
              fill={a.meta.color}
              initial={
                fige
                  ? { cx: a.arrivee.x, cy: a.arrivee.y, opacity: 1 }
                  : { cx: a.depart.x, cy: a.depart.y, opacity: 0 }
              }
              animate={{ cx: a.arrivee.x, cy: a.arrivee.y, opacity: 1 }}
              transition={
                fige
                  ? { duration: 0 }
                  : { duration: 1.15, delay: 0.25 + i * 0.16, ease: [0.16, 1, 0.3, 1] }
              }
            />
          </g>
        ))}

        {/* Les noms, en jeton de texte — jamais dans la couleur de la planete.
            Mesure du 17/09 : l or du Soleil en lettres tombe a 1,86 en clair. */}
        {astres.map((a, i) => (
          <motion.text
            key={`t-${a.clef}`}
            x={a.texte.x}
            y={a.texte.y}
            textAnchor={a.ancrage}
            dominantBaseline="middle"
            fill="var(--text-heading)"
            style={{ fontSize: 11, fontWeight: 500 }}
            initial={fige ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fige ? { duration: 0 } : { duration: 0.4, delay: 1.1 + i * 0.16 }}
          >
            {a.nom}
          </motion.text>
        ))}
      </svg>

      {/*
        La provenance. C est elle, plus que le dessin, qui fait la credibilite :
        la quasi-totalite des visualisations jugees fiables citent leur source.
        Elle dit la date du calcul, et rien d autre.
      */}
      <figcaption
        className="mt-2 text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-body)", letterSpacing: "0.14em" }}
        data-ciel-provenance
      >
        {dateLisible}
      </figcaption>
    </figure>
  );
}
