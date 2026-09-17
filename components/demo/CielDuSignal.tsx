"use client";

/**
 * Le ciel d un signal — le systeme solaire de l onboarding, aux vraies positions.
 *
 * ─── L HISTOIRE, PARCE QU ELLE EXPLIQUE CE FICHIER ──────────────────────────
 *
 * Trois versions le 17/09. Un cercle plat avec deux points : « ce truc est
 * super moche ». Puis des orbites elliptiques : « dans l onboarding, on ne voit
 * pas le systeme solaire de biais, on le voit par-dessus, avec des beaux
 * cercles bien ronds. Je voudrais que ce soit exactement de la meme maniere. »
 *
 * Il avait raison les deux fois, et la deuxieme correction vient d une erreur
 * de ma part : j avais repris `components/landing/LoadingNarrator.tsx`, qui est
 * la page d accueil du SITE et qui est elliptique. L onboarding de l app, c est
 * `StepTimelineTeaser` — vue du dessus, cercles parfaits, Soleil au centre.
 *
 * Ce fichier reprend SA technique, trait pour trait :
 *
 *   — des div `rounded-full`, pas du SVG ;
 *   — un anneau par planete, 1 px de violet a 14 % ;
 *   — le Soleil au centre, avec sa lueur a trois couches ;
 *   — et surtout : la planete est posee sur un conteneur qui FAIT LE TOUR, avec
 *     une contre-rotation sur le point pour qu il reste droit.
 *
 * ─── LA SEULE DIFFERENCE, ET C EST TOUT L INTERET ───────────────────────────
 *
 * Dans l onboarding, `toAngle` est ecrit en dur : le dessin est un exemple,
 * assume comme tel. Ici, l angle d arrivee est la LONGITUDE ECLIPTIQUE REELLE
 * mesuree par le moteur a la date de la periode.
 *
 * Les planetes tournent une ou deux fois, puis se posent — la ou elles etaient
 * vraiment ce jour-la. C est le meme mouvement, et il dit quelque chose.
 *
 * ─── DEUX CHOSES QUE JE N AI PAS REPRISES ───────────────────────────────────
 *
 * Le halo de zone : il marque « ta zone » dans l onboarding, ce qui n a pas de
 * sens ici.
 *
 * Et les positions sont GEOCENTRIQUES — c est l angle sous lequel on voit la
 * planete depuis la Terre. Le Soleil au centre reste donc un point de repere
 * visuel, comme dans l onboarding, pas une affirmation d heliocentrisme. Le
 * Soleil, quand il fait partie du signal, a lui aussi son anneau et sa vraie
 * longitude : il n est pas au milieu.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { planetConfig, getPlanetLabel, type PlanetKey } from "@/lib/domain-config";
import type { Locale } from "@/lib/i18n-demo";
import type { Position } from "@/lib/positions-api";

/** Le cadre, et le centre. Les memes proportions que l onboarding, en plus bas. */
const CENTRE = 118;

/** Les rayons d orbite, du plus proche au plus lointain. */
const ORBITES: Record<string, { rayon: number; taille: number }> = {
  moon: { rayon: 26, taille: 5 },
  mercury: { rayon: 42, taille: 5 },
  venus: { rayon: 56, taille: 7 },
  sun: { rayon: 70, taille: 11 },
  mars: { rayon: 70, taille: 6 },
  jupiter: { rayon: 86, taille: 10 },
  saturn: { rayon: 98, taille: 9 },
  uranus: { rayon: 106, taille: 7 },
  neptune: { rayon: 112, taille: 7 },
  pluto: { rayon: 116, taille: 5 },
};

/** L ordre reel, pour que deux anneaux ne se croisent jamais. */
const ORDRE = ["moon", "mercury", "venus", "sun", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

const DEPART_ORBITE = 0.5;
const DUREE_ORBITE = 2.1;

/**
 * La longitude, en angle de rotation CSS.
 *
 * Zero a gauche et sens inverse des aiguilles, comme toute carte du ciel. La
 * rotation CSS part du haut et tourne dans le sens des aiguilles : d ou le
 * decalage et le signe.
 */
function angleDe(longitude: number): number {
  return 270 - longitude;
}

export function CielDuSignal({
  positions,
  locale,
  dateLisible,
  initiale,
}: {
  positions: Position[] | null;
  locale: Locale;
  dateLisible: string;
  /**
   * L initiale de la personne, au centre.
   *
   * Christophe, le 17/09 : « si au centre c est le user, alors utilise
   * l avatar pour qu il se reconnaisse ».
   *
   * Il a raison, et ca leve une ambiguite que j avais laissee : le Soleil
   * etait au centre ET sur son anneau, deux fois la meme chose a deux
   * endroits. Le centre n est pas un astre, c est le point de vue — les
   * longitudes sont geocentriques, donc tout ce qu on voit est place PAR
   * RAPPORT A QUELQU UN. Autant que ce soit lui.
   *
   * Absente, on retombe sur un point neutre plutot que d inventer une lettre.
   */
  initiale?: string | null;
}) {
  const fige = useReducedMotion();

  const astres = useMemo(() => {
    if (!positions) return [];
    return positions
      .map((p) => {
        const meta = planetConfig[p.planete as PlanetKey];
        const orbite = ORBITES[p.planete];
        if (!meta || !orbite) return null;
        const arrivee = angleDe(p.longitude);
        return {
          clef: p.planete as PlanetKey,
          meta,
          ...orbite,
          longitude: p.longitude,
          // Le depart : un demi-tour en arriere, plus un tour complet. La
          // planete fait donc le tour AVANT de se poser — c est ce trajet qui
          // montre que la position finale est calculee, pas choisie.
          depart: arrivee - 360 - 180,
          arrivee,
          nom: getPlanetLabel(p.planete as PlanetKey, locale) ?? meta.label,
          rang: ORDRE.indexOf(p.planete),
        };
      })
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => a.rang - b.rang);
  }, [positions, locale]);

  if (astres.length === 0) return null;

  return (
    <figure className="m-0 flex flex-col items-center" data-ciel={astres.length}>
      <div className="relative" style={{ width: CENTRE * 2, height: CENTRE * 2 }}>
        {/* Les anneaux. Un par planete, du violet de marque a 14 % : le blanc
            a 4 % de l onboarding est invisible en theme clair. */}
        {astres.map((a, i) => (
          <motion.div
            key={`o-${a.clef}`}
            className="absolute rounded-full"
            style={{
              width: a.rayon * 2,
              height: a.rayon * 2,
              left: CENTRE - a.rayon,
              top: CENTRE - a.rayon,
              border: "1px solid color-mix(in srgb, var(--accent-purple) 16%, transparent)",
            }}
            initial={fige ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fige ? { duration: 0 } : { delay: 0.15 + i * 0.08, duration: 0.5 }}
          />
        ))}

        {/* AU CENTRE, LA PERSONNE — pas un astre.

            L onboarding met un Soleil la, et il peut se le permettre : son
            dessin est un exemple. Ici les longitudes sont GEOCENTRIQUES, donc
            tout est place par rapport a un point de vue. Mettre le Soleil au
            centre alors qu il a deja son anneau, c etait le representer deux
            fois pour deux choses differentes.

            Le disque garde la presence que le Soleil avait — meme taille, meme
            halo doux — mais il porte une initiale. On se reconnait au milieu de
            son propre ciel. */}
        <motion.div
          className="absolute flex items-center justify-center rounded-full font-semibold"
          style={{
            width: 30,
            height: 30,
            left: CENTRE - 15,
            top: CENTRE - 15,
            zIndex: 20,
            fontSize: 13,
            background: "var(--bg-brand)",
            color: "var(--text-on-brand)",
            boxShadow: "0 0 0 4px var(--bg-secondary), 0 0 26px color-mix(in srgb, var(--bg-brand) 45%, transparent)",
          }}
          initial={fige ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={fige ? { duration: 0 } : { delay: 0.2, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
          aria-hidden="true"
        >
          {(initiale ?? "").slice(0, 1).toUpperCase()}
        </motion.div>

        {/* Les planetes. Le conteneur fait le tour, le point contre-tourne pour
            rester droit — exactement la technique de l onboarding. */}
        {astres.map((a, i) => (
          <motion.div
            key={a.clef}
            className="absolute"
            style={{
              width: a.rayon * 2,
              height: a.rayon * 2,
              left: CENTRE - a.rayon,
              top: CENTRE - a.rayon,
              zIndex: 10,
            }}
            initial={{ rotate: fige ? a.arrivee : a.depart }}
            animate={{ rotate: a.arrivee }}
            transition={
              fige
                ? { duration: 0 }
                : { delay: DEPART_ORBITE + i * 0.1, duration: DUREE_ORBITE, ease: [0.4, 0, 0.2, 1] }
            }
          >
            <div className="absolute" style={{ left: "50%", top: 0, transform: "translate(-50%, -50%)" }}>
              <motion.div
                className="relative"
                initial={{ rotate: fige ? -a.arrivee : -a.depart }}
                animate={{ rotate: -a.arrivee }}
                transition={
                  fige
                    ? { duration: 0 }
                    : { delay: DEPART_ORBITE + i * 0.1, duration: DUREE_ORBITE, ease: [0.4, 0, 0.2, 1] }
                }
              >
                <motion.div
                  data-planete={a.clef}
                  data-longitude={a.longitude.toFixed(2)}
                  className="rounded-full"
                  style={{ width: a.taille, height: a.taille, backgroundColor: a.meta.color }}
                  initial={fige ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.4 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    boxShadow: `0 0 ${a.taille * 2.4}px ${a.meta.color}70`,
                  }}
                  transition={
                    fige ? { duration: 0 } : { delay: DEPART_ORBITE + i * 0.1, duration: 0.6 }
                  }
                />

                {/* L anneau qui bat, une fois posee. Le meme que l onboarding
                    donne a ses planetes allumees.

                    IL EST CENTRE PAR ARITHMETIQUE, PAS PAR `transform`.

                    Premiere version : `left: 50%; top: 50%` plus un
                    `translate(-50%, -50%)` dans le style. C est le reflexe
                    habituel, et il est FAUX ici : `motion` compose sa propre
                    transformation quand il anime `scale`, et ecrase celle du
                    style. L anneau se retrouvait avec son coin en haut a gauche
                    sur le point, donc decale vers le bas a droite de la moitie
                    de sa taille.

                    Christophe l a vu tout de suite : « les planetes ne sont pas
                    au centre des cercles ». Le decalage etait systematique, donc
                    lisible comme une faute de dessin.

                    En posant `left` et `top` en points, il n y a plus de
                    transformation a ecraser. */}
                {!fige && (
                  <motion.div
                    className="absolute rounded-full"
                    style={{
                      width: (a.taille + 5) * 2,
                      height: (a.taille + 5) * 2,
                      left: a.taille / 2 - (a.taille + 5),
                      top: a.taille / 2 - (a.taille + 5),
                      border: `1px solid ${a.meta.color}`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 0.35, 0], scale: [0.8, 1.4, 1.8] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      ease: "easeOut",
                      delay: DEPART_ORBITE + DUREE_ORBITE + i * 0.2,
                    }}
                  />
                )}

                {/* Le nom. En jeton de texte, jamais dans la couleur de la
                    planete : l or du Soleil en lettres tombe a 1,86 en clair. */}
                <motion.span
                  className="absolute left-1/2 whitespace-nowrap text-[10px] font-semibold"
                  style={{
                    top: a.taille / 2 + 5,
                    transform: "translateX(-50%)",
                    color: "var(--text-heading)",
                  }}
                  initial={fige ? { opacity: 1 } : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={
                    fige ? { duration: 0 } : { delay: DEPART_ORBITE + DUREE_ORBITE, duration: 0.5 }
                  }
                >
                  {a.nom}
                </motion.span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/*
        La provenance. C est elle, plus que le dessin, qui fait la credibilite :
        la quasi-totalite des visualisations jugees fiables citent leur source.
      */}
      <figcaption
        className="mt-1 text-[11px] font-semibold uppercase"
        style={{ color: "var(--text-body)", letterSpacing: "0.14em" }}
        data-ciel-provenance
      >
        {dateLisible}
      </figcaption>
    </figure>
  );
}
