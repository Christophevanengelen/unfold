"use client";

/**
 * La bande du jour — a quoi ressemblait la journee, ce jour-la.
 *
 * ─── CE QU ELLE MONTRE ──────────────────────────────────────────────────────
 *
 * Vingt-quatre heures, de minuit a minuit, decoupees aux heures REELLES du
 * soleil : nuit, crepuscule astronomique, nautique, civil, plein jour, puis la
 * symetrie du soir. Calculees en local par `lib/soleil.ts`, sans reseau.
 *
 * Verifie contre des ephemerides publiees : Bruxelles au solstice d ete, lever
 * 05:29 et coucher 22:00 — a la minute pres.
 *
 * ─── POURQUOI ELLE EST BELLE, ET POURQUOI ELLE EST VRAIE ────────────────────
 *
 * Cinq a sept aplats d une meme rampe, aucun degrade, aucun trait. La forme
 * porte tout : une journee de decembre et une journee de juin ne se ressemblent
 * pas, et ca se voit sans une seule etiquette.
 *
 * C est la reponse a « trop de texte, pas assez d illustrations » : une image
 * qui se lit en un dixieme de seconde et qui ne dit que des faits.
 *
 * ─── CE QU ELLE NE FAIT PAS ─────────────────────────────────────────────────
 *
 * AUCUN DEGRADE. La tentation serait un fondu du bleu nuit a l or : c est
 * exactement le cliche que la veille de ce jour-la nomme, et ca ferait perdre
 * les seuils — un fondu n a pas de frontiere, donc ne montre plus rien.
 *
 * AUCUN REPERE D INSTANT. Une periode porte une DATE, pas une heure. Poser un
 * trait « c est arrive a telle heure » serait inventer.
 *
 * AUX POLES, ELLE SE TAIT. Quand le soleil ne se leve pas — ou ne se couche
 * pas — les seuils n existent pas. On ne dessine pas une journee qui n a pas eu
 * lieu : le composant rend `null`.
 */

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { heuresDuJour } from "@/lib/soleil";

const MINUTES = 24 * 60;

/**
 * Les aplats, du plus sombre au plus clair.
 *
 * Ils passent par les jetons pour basculer en theme sombre sans etre
 * redessines. `--bg-tertiary` est le fond, et chaque cran monte vers le blanc
 * de marque par un `color-mix` — cinq pas d une seule rampe, pas cinq couleurs
 * choisies une a une.
 */
const APLATS = {
  nuit: "var(--jour-nuit)",
  astronomique: "var(--jour-astronomique)",
  nautique: "var(--jour-nautique)",
  civil: "var(--jour-civil)",
  jour: "var(--jour-plein)",
} as const;

/**
 * DEUX ERREURS AVANT D ARRIVER A CES JETONS.
 *
 * 1. La rampe etait a 26 / 19 / 12 / 6 % de violet. Trop pale : la bande se
 *    lisait comme une seule barre claire avec de vagues variations. Or toute
 *    la valeur de cette figure est la FORME de la journee. Sans ecart entre
 *    les aplats, il n y a plus de forme, donc plus rien a voir.
 *
 * 2. Doublee, elle est devenue lisible en clair — et FAUSSE en sombre. Un
 *     vers l accent s inverse : le violet est plus clair que le
 *    fond en theme sombre, donc la nuit devenait plus lumineuse que le jour.
 *    Le code etait le meme, le sens s inversait. Invisible autrement qu a
 *    l ecran.
 *
 * D ou des JETONS, declares une fois par theme dans globals.css. Le composant
 * ne connait que les noms, et la regle tient dans les deux sens : la nuit est
 * toujours la plus eloignee du jour, dans la direction du contraste.
 */

interface Segment {
  debut: number;
  fin: number;
  fond: string;
}

export function BandeDuJour({
  date,
  latitude,
  longitude,
  decalageMinutes,
  libelle,
}: {
  /** La date de la periode, en ISO. */
  date: string;
  latitude: number;
  longitude: number;
  /** Le decalage du lieu par rapport a UTC ce jour-la, en minutes. */
  decalageMinutes: number;
  /** « 9 h 12 de jour », deja formate et traduit par l appelant. */
  libelle: string;
}) {
  const fige = useReducedMotion();

  const segments = useMemo<Segment[] | null>(() => {
    const h = heuresDuJour(date, latitude, longitude, decalageMinutes);
    if (!h) return null;
    // Pas de lever : la journee n a pas de forme a montrer.
    if (h.lever === null || h.coucher === null) return null;

    // Les bornes, dans l ordre. Celles qui manquent — le crepuscule
    // astronomique n existe pas en juin sous nos latitudes — sont simplement
    // absentes, et l aplat voisin prend leur place.
    const bornes: { a: number | null; fond: string }[] = [
      { a: 0, fond: APLATS.nuit },
      { a: h.auroreAstronomique, fond: APLATS.astronomique },
      { a: h.auroreNautique, fond: APLATS.nautique },
      { a: h.auroreCivile, fond: APLATS.civil },
      { a: h.lever, fond: APLATS.jour },
      { a: h.coucher, fond: APLATS.civil },
      { a: h.crepusculeCivil, fond: APLATS.nautique },
      { a: h.crepusculeNautique, fond: APLATS.astronomique },
      { a: h.crepusculeAstronomique, fond: APLATS.nuit },
    ];

    const retenues = bornes
      .filter((b): b is { a: number; fond: string } => b.a !== null)
      .map((b) => ({ ...b, a: Math.max(0, Math.min(MINUTES, b.a)) }))
      .sort((x, y) => x.a - y.a);

    const out: Segment[] = [];
    for (let i = 0; i < retenues.length; i++) {
      const debut = retenues[i].a;
      const fin = i + 1 < retenues.length ? retenues[i + 1].a : MINUTES;
      if (fin > debut) out.push({ debut, fin, fond: retenues[i].fond });
    }
    return out.length > 1 ? out : null;
  }, [date, latitude, longitude, decalageMinutes]);

  if (!segments) return null;

  return (
    <figure className="m-0 w-full" data-bande={segments.length}>
      <div className="flex h-[26px] w-full overflow-hidden rounded-[3px]" role="img" aria-label={libelle}>
        {segments.map((s, i) => (
          <motion.div
            key={`${s.debut}-${i}`}
            style={{ width: `${((s.fin - s.debut) / MINUTES) * 100}%`, background: s.fond }}
            initial={fige ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fige ? { duration: 0 } : { duration: 0.35, delay: 0.1 + i * 0.05 }}
          />
        ))}
      </div>
      <figcaption className="mt-1.5 text-[11px]" style={{ color: "var(--text-body)" }}>
        {libelle}
      </figcaption>
    </figure>
  );
}
