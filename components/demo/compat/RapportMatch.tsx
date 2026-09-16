"use client";

/**
 * Le rapport de compatibilite : ce que deux naissances disent d un lien.
 *
 * ─── CE QU IL REMPLACE ──────────────────────────────────────────────────────
 *
 * Le rapport precedent empilait des fenetres de timing. Christophe a tranche :
 * « on a abandonne l approche du timing, les gens veulent un score de
 * compatibilite en testant leur dating, donc une fiche de compatibilite
 * generale plutot que dans le temps ». Ce qui suit est general ; le temps n y
 * apparait plus du tout.
 *
 * ─── LA STRUCTURE, ET D OU ELLE VIENT ───────────────────────────────────────
 *
 * Segel & Heer (Stanford, 2010) decrivent trois formes de recit chiffre. Celle
 * qui convient ici est le « martini glass » : un pied etroit ou l auteur guide
 * — on devine, on revele, on qualifie — puis un calice qui s ouvre sur le
 * detail que le lecteur fouille a son rythme.
 *
 *   1. On devine avant de voir      (une seule fois par lien)
 *   2. Le chiffre, et ce qu il vaut
 *   3. Les trois mesures de fond    (petites vignettes)
 *   4. Ce qui circule entre vous    (petites vignettes)
 *   5. L asymetrie, quand elle existe
 *   6. Ce que chacun met dans le lien (paires)
 *   7. Qui donne le tempo, si c est net
 *   8. La methode, visible
 *   9. Ce qu on garde, et qu on peut partager
 *
 * ─── LES CINQ DECISIONS QUI TIENNENT LE TON ─────────────────────────────────
 *
 * 1. **On devine avant de voir.** Le format « You Draw It » du New York Times :
 *    le lecteur pose son hypothese, puis voit la donnee. C est documente comme
 *    produisant une lecture plus juste et plus de reflexion qu un chiffre subi
 *    (Distill, 2020). Aucun produit d astrologie ne le fait. Une seule fois par
 *    lien : la deuxieme visite ne rejoue pas un jeu deja joue.
 *
 * 2. **Rien de genere ne remplace un fait.** Le reproche fait a Spotify Wrapped
 *    2024 n etait pas d avoir ajoute de l IA, c etait d avoir SUPPRIME les
 *    genres au profit d un texte genere. Ici chaque phrase correspond a une
 *    valeur mesuree ; aucun paragraphe n est ecrit a la volee.
 *
 * 3. **Le ton ne juge pas une vie.** Monzo a fini devant le mediateur financier
 *    britannique pour un recap automatique qui moquait les depenses d une
 *    cliente. Un rapport sur un couple touche plus fragile encore. D ou :
 *    aucune couleur de verdict, et un palier bas qui dit « exigeant ne veut pas
 *    dire rate » au lieu de laisser le chiffre parler seul.
 *
 * 4. **La methode est visible.** The Pudding publie ses sources pour gagner la
 *    confiance. Tout le marche — Astrodienst, Co-Star, The Pattern — se fait
 *    reprocher l opacite et le gabarit. Dire ce qui est calcule et ce que ca ne
 *    pretend pas est le seul avantage que les concurrents ne peuvent pas copier
 *    sans se contredire.
 *
 * 5. **Ce qu on partage n est pas la note.** On partage ce que les deux ont en
 *    commun. Un score bas est structurellement impartageable, et un produit qui
 *    ne se partage que quand il flatte est un produit qui pousse a flatter.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { t, type Locale } from "@/lib/i18n-demo";
import { useLocale } from "@/lib/use-locale";
import { fetchMatch, matchEnCache, type RaisonMatch } from "@/lib/match-api";
import { lireMatch, type Dimension, type LectureMatch } from "@/lib/match-lecture";
import type { BirthData } from "@/lib/birth-data";
import { choisir, franchir, reussi, toucher } from "@/lib/haptique";
import { Anneau, Arc, Paire, Piste, Section } from "./rapport/visuels";

/** Les liens dont on a deja joue la devinette. Un jeu ne se rejoue pas. */
const CLE_DEVINE = "unfold_match_devine";

function dejaDevine(clef: string): boolean {
  if (typeof window === "undefined") return true;
  try {
    const l = JSON.parse(localStorage.getItem(CLE_DEVINE) ?? "[]") as string[];
    return Array.isArray(l) && l.includes(clef);
  } catch {
    return true;
  }
}

function marquerDevine(clef: string): void {
  if (typeof window === "undefined") return;
  try {
    const l = JSON.parse(localStorage.getItem(CLE_DEVINE) ?? "[]") as string[];
    const liste = Array.isArray(l) ? l : [];
    if (!liste.includes(clef)) localStorage.setItem(CLE_DEVINE, JSON.stringify([...liste, clef].slice(-60)));
  } catch {
    /* sans stockage, la devinette se rejoue : genant, jamais bloquant */
  }
}

function remplir(modele: string, valeurs: Record<string, string | number>): string {
  return modele.replace(/\{(\w+)\}/g, (_, c: string) => String(valeurs[c] ?? `{${c}}`));
}

interface RapportMatchProps {
  moi: BirthData;
  autre: BirthData;
  nomAutre: string;
  /** Le parent gere le defilement — on ne pose pas de conteneur a nous. */
  embedded?: boolean;
}

export function RapportMatch({ moi, autre, nomAutre, embedded }: RapportMatchProps) {
  const locale = useLocale();
  const [lecture, setLecture] = useState<LectureMatch | null>(() => lireMatch(matchEnCache(moi, autre)));
  const [raison, setRaison] = useState<RaisonMatch | null>(null);
  const [charge, setCharge] = useState(!lecture);
  const [essai, setEssai] = useState(0);

  const clefLien = `${autre.birthDate}|${autre.birthTime}`;
  const [devine, setDevine] = useState<number | null>(null);
  // Lu une seule fois, a l initialisation. Un effet qui poserait cet etat
  // apres coup ferait clignoter l ouverture : le rapport apparaitrait, puis la
  // devinette le recouvrirait. L ecran n est jamais rendu cote serveur — il
  // depend d une connexion qui vit dans le stockage de l appareil — mais le
  // garde-fou reste, une lecture de localStorage ne se tente pas sans fenetre.
  const [aDevine, setADevine] = useState(() =>
    typeof window === "undefined" ? true : dejaDevine(clefLien),
  );

  /** Sans les deux naissances completes, il n y a rien a calculer. */
  const naissancesCompletes = Boolean(moi?.birthDate && autre?.birthDate);

  useEffect(() => {
    if (!naissancesCompletes) return;
    let annule = false;
    (async () => {
      const r = await fetchMatch(moi, autre, nomAutre);
      if (annule) return;
      if (r.ok) {
        const l = lireMatch(r.match);
        if (l) {
          setLecture(l);
          setRaison(null);
        } else {
          setRaison("reponse_illisible");
        }
      } else {
        setRaison(r.raison);
      }
      setCharge(false);
    })();
    return () => {
      annule = true;
    };
  }, [moi, autre, nomAutre, essai, naissancesCompletes]);

  const conteneur = embedded ? "" : "min-h-screen overflow-y-auto";

  if (!naissancesCompletes) {
    return (
      <div className={conteneur}>
        <EnPanne locale={locale} raison="naissance_incomplete" sur={() => setEssai((n) => n + 1)} />
      </div>
    );
  }
  if (charge) return <div className={conteneur}><EnAttente locale={locale} /></div>;
  if (!lecture) {
    return (
      <div className={conteneur}>
        <EnPanne locale={locale} raison={raison} sur={() => setEssai((n) => n + 1)} />
      </div>
    );
  }

  // Le pied du martini : on devine, puis on revele. Passe cette etape, tout le
  // reste du rapport est la, d un seul tenant.
  if (!aDevine && devine === null) {
    return (
      <div className={conteneur}>
        <Devinette
          locale={locale}
          nomAutre={nomAutre}
          sur={(v) => {
            marquerDevine(clefLien);
            if (v !== null) franchir();
            setDevine(v ?? -1);
            setADevine(true);
          }}
        />
      </div>
    );
  }

  return (
    <div className={conteneur}>
      <Corps
        lecture={lecture}
        locale={locale}
        nomAutre={nomAutre}
        nomMoi={moi.nickname || "—"}
        estimation={devine !== null && devine >= 0 ? devine : null}
      />
    </div>
  );
}

/* ─── L ATTENTE ────────────────────────────────────────────────────────────
 * Le moteur repond en moins d une seconde. On ne met donc ni barre de
 * progression ni pourcentage : les deux mentiraient sur une attente qui se
 * compte en dixiemes. Une phrase qui dit ce qui se passe suffit.
 */
function EnAttente({ locale }: { locale: Locale }) {
  const fige = useReducedMotion();
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <motion.div
        className="h-10 w-10 rounded-full"
        style={{ background: "var(--accent-purple)" }}
        animate={fige ? undefined : { scale: [1, 1.18, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <p className="text-[13px] text-text-body-subtle">{t("rapport.charge", locale)}</p>
    </div>
  );
}

function EnPanne({
  locale,
  raison,
  sur,
}: {
  locale: Locale;
  raison: RaisonMatch | null;
  sur: () => void;
}) {
  const manque = raison === "naissance_incomplete";
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <p className="text-[15px] font-semibold text-text-heading">
        {t(manque ? "rapport.naissance_manquante" : "rapport.erreur", locale)}
      </p>
      {!manque ? (
        <button
          type="button"
          onClick={() => {
            toucher();
            sur();
          }}
          className="rounded-full px-5 py-2.5 text-[14px] font-semibold"
          style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
        >
          {t("rapport.reessayer", locale)}
        </button>
      ) : null}
    </div>
  );
}

/* ─── LA DEVINETTE ─────────────────────────────────────────────────────────
 * Un curseur, pas un champ. Personne ne tape un nombre sur un telephone pour
 * repondre a une intuition ; on glisse. La valeur de depart est 50 et non un
 * chiffre flatteur : une valeur haute par defaut fabriquerait de la deception.
 */
function Devinette({
  locale,
  nomAutre,
  sur,
}: {
  locale: Locale;
  nomAutre: string;
  sur: (valeur: number | null) => void;
}) {
  const [v, setV] = useState(50);
  return (
    <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
      <EyebrowLabel color="var(--text-body-subtle)">{t("rapport.eyebrow", locale)}</EyebrowLabel>
      <h2 className="text-[22px] font-semibold text-text-heading">{t("rapport.devine_titre", locale)}</h2>
      <p className="max-w-[26ch] text-[14px] leading-snug text-text-body">
        {t("rapport.devine_aide", locale)}
      </p>

      <div className="w-full max-w-[280px]">
        <div
          className="text-[44px] font-semibold tabular-nums leading-none"
          style={{ color: "var(--accent-purple)" }}
        >
          {v}
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={v}
          aria-label={t("rapport.devine_aide", locale)}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Math.abs(n - v) >= 5) choisir();
            setV(n);
          }}
          className="mt-5 w-full"
          style={{ accentColor: "var(--accent-purple)" }}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => sur(v)}
          className="rounded-full px-7 py-3 text-[15px] font-semibold"
          style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
        >
          {t("rapport.devine_valider", locale)}
        </button>
        <button
          type="button"
          onClick={() => sur(null)}
          className="text-[13px] font-medium text-text-body-subtle underline underline-offset-2"
        >
          {t("rapport.devine_passer", locale)}
        </button>
      </div>
      <p className="max-w-[30ch] text-[11px] leading-snug text-text-body-subtle">
        {nomAutre}
      </p>
    </div>
  );
}

/* ─── LE CORPS ─────────────────────────────────────────────────────────────── */

function Corps({
  lecture,
  locale,
  nomAutre,
  nomMoi,
  estimation,
}: {
  lecture: LectureMatch;
  locale: Locale;
  nomAutre: string;
  nomMoi: string;
  estimation: number | null;
}) {
  const ecart = estimation === null ? null : lecture.score - estimation;

  return (
    <div className="mx-auto w-full max-w-[420px] px-5 pb-28 pt-4">
      <TeteScore lecture={lecture} locale={locale} ecart={ecart} nomAutre={nomAutre} nomMoi={nomMoi} />

      <Grille
        titre={t("rapport.socle_titre", locale)}
        aide={t("rapport.socle_aide", locale)}
        dimensions={lecture.socle}
        locale={locale}
        delai={0}
      />

      <Grille
        titre={t("rapport.nuances_titre", locale)}
        aide={t("rapport.nuances_aide", locale)}
        dimensions={lecture.nuances}
        locale={locale}
        delai={0.05}
      />

      <Asymetrie lecture={lecture} locale={locale} nomAutre={nomAutre} />
      <Apports lecture={lecture} locale={locale} nomAutre={nomAutre} />
      <Tempo lecture={lecture} locale={locale} nomAutre={nomAutre} />
      <Commun lecture={lecture} locale={locale} nomAutre={nomAutre} nomMoi={nomMoi} />
      <Methode locale={locale} />
    </div>
  );
}

function TeteScore({
  lecture,
  locale,
  ecart,
  nomAutre,
  nomMoi,
}: {
  lecture: LectureMatch;
  locale: Locale;
  ecart: number | null;
  nomAutre: string;
  nomMoi: string;
}) {
  return (
    <Section className="flex flex-col items-center pb-8 pt-2 text-center">
      <div className="flex items-center gap-2">
        <Anneau lettre={nomMoi} taille={34} />
        <Anneau lettre={nomAutre} taille={34} doux />
      </div>
      <EyebrowLabel color="var(--text-body-subtle)" className="mt-4">
        {t("rapport.score_titre", locale)}
      </EyebrowLabel>

      <Arc
        valeur={lecture.score}
        delai={0.15}
        enfant={
          <>
            <span
              className="text-[52px] font-semibold leading-none tabular-nums"
              style={{ color: "var(--accent-purple)" }}
            >
              {lecture.score}
            </span>
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-body-subtle">
              / 100
            </span>
          </>
        }
      />

      <p className="mt-3 max-w-[30ch] text-[15px] font-semibold leading-snug text-text-heading">
        {t(`rapport.palier_${lecture.palier}`, locale)}
      </p>
      <p className="mt-1.5 max-w-[32ch] text-[12px] leading-snug text-text-body-subtle">
        {t("rapport.score_aide", locale)}
      </p>

      {ecart !== null ? <Ecart ecart={ecart} locale={locale} /> : null}
    </Section>
  );
}

/**
 * Le retour sur l estimation. La phrase reprend la forme qui marche chez Exist :
 * une direction, une intensite, un chiffre. « Tu vous sous-estimais de 14
 * points » se verifie ; « vous etes plus compatibles que tu ne crois » ne se
 * verifie pas.
 */
function Ecart({ ecart, locale }: { ecart: number; locale: Locale }) {
  const n = Math.abs(ecart);
  const texte =
    n <= 5
      ? t("rapport.ecart_juste", locale)
      : remplir(t(ecart > 0 ? "rapport.ecart_sous" : "rapport.ecart_sur", locale), { n });
  return (
    <p
      className="mt-4 rounded-full px-4 py-1.5 text-[12px] font-semibold"
      style={{ background: "var(--surface-light)", color: "var(--text-heading)" }}
    >
      {texte}
    </p>
  );
}

/**
 * La grille de petites vignettes. Deux colonnes des que la place existe : la
 * comparaison entre mesures se fait a l oeil, cote a cote, pas en defilant.
 */
function Grille({
  titre,
  aide,
  dimensions,
  locale,
  delai,
}: {
  titre: string;
  aide: string;
  dimensions: Dimension[];
  locale: Locale;
  delai: number;
}) {
  if (dimensions.length === 0) return null;
  return (
    <Section className="pb-8" delai={delai}>
      <h3 className="text-[16px] font-semibold text-text-heading">{titre}</h3>
      <p className="mt-0.5 text-[12px] leading-snug text-text-body-subtle">{aide}</p>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-5">
        {dimensions.map((d, i) => (
          <Piste
            key={d.clef}
            titre={t(d.clef, locale)}
            aide={t(`${d.clef}_aide`, locale)}
            valeur={d.valeur}
            niveau={t(`match.${d.palier}`, locale)}
            delai={0.08 * i}
          />
        ))}
      </div>
    </Section>
  );
}

/**
 * L asymetrie. C est la carte que personne d autre n ecrit : tous les produits
 * du marche rendent un chiffre unique pour un lien a deux. Le moteur, lui,
 * mesure les deux sens — on ne moyenne pas une information qui existe.
 */
function Asymetrie({
  lecture,
  locale,
  nomAutre,
}: {
  lecture: LectureMatch;
  locale: Locale;
  nomAutre: string;
}) {
  const a = lecture.nuances.find((d) => d.asymetrique);
  if (!a || a.versLui === undefined || a.versElle === undefined) return null;
  return (
    <Section className="pb-8" delai={0.05}>
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-secondary)" }}>
        <h3 className="text-[16px] font-semibold leading-snug text-text-heading">
          {t("rapport.asym_titre", locale)}
        </h3>
        <div className="mt-4 space-y-4">
          <Piste
            titre={remplir(t("rapport.asym_toi", locale), { nom: nomAutre })}
            valeur={a.versElle}
            niveau={t("match.moyen", locale)}
          />
          <Piste
            titre={remplir(t("rapport.asym_autre", locale), { nom: nomAutre })}
            valeur={a.versLui}
            niveau={t("match.moyen", locale)}
            delai={0.1}
          />
        </div>
        <p className="mt-3 text-[11px] leading-snug text-text-body-subtle">
          {t("rapport.asym_aide", locale)}
        </p>
      </div>
    </Section>
  );
}

/**
 * Ce que chacun met dans le lien. Sur le couple mesure le 16/09, sept des dix
 * terrains valaient zero des deux cotes : un radar a dix branches aurait dessine
 * une etoile a trois pointes dans un cadre a dix, c est-a-dire un graphique qui
 * ment sur sa densite. On montre les terrains qui portent, et on DIT combien
 * sont restes muets plutot que de les masquer.
 */
function Apports({
  lecture,
  locale,
  nomAutre,
}: {
  lecture: LectureMatch;
  locale: Locale;
  nomAutre: string;
}) {
  if (lecture.porteurs.length === 0) return null;
  const muets =
    lecture.axesMuets === 0
      ? null
      : remplir(t(lecture.axesMuets === 1 ? "rapport.muets_un" : "rapport.muets_n", locale), {
          n: lecture.axesMuets,
          nom: nomAutre,
        });
  return (
    <Section className="pb-8" delai={0.05}>
      <h3 className="text-[16px] font-semibold text-text-heading">
        {t("rapport.apports_titre", locale)}
      </h3>
      <p className="mt-0.5 text-[12px] leading-snug text-text-body-subtle">
        {t("rapport.apports_aide", locale)}
      </p>

      <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-text-body-subtle">
        <span>{t("rapport.apports_toi", locale)}</span>
        <span>{remplir(t("rapport.apports_autre", locale), { nom: nomAutre })}</span>
      </div>

      <div className="mt-2 space-y-4">
        {lecture.porteurs.map((p, i) => (
          <Paire
            key={p.axe}
            titre={t(p.clef, locale)}
            aide={t(`${p.clef}_aide`, locale)}
            gauche={p.lui}
            droite={p.elle}
            delai={0.07 * i}
            etiquetteGauche={t("rapport.apports_toi", locale)}
            etiquetteDroite={nomAutre}
          />
        ))}
      </div>

      {muets ? <p className="mt-4 text-[11px] leading-snug text-text-body-subtle">{muets}</p> : null}
    </Section>
  );
}

function Tempo({
  lecture,
  locale,
  nomAutre,
}: {
  lecture: LectureMatch;
  locale: Locale;
  nomAutre: string;
}) {
  if (!lecture.ascendant) return null;
  const { qui, confiance } = lecture.ascendant;
  return (
    <Section className="pb-8" delai={0.05}>
      <div className="rounded-2xl p-4" style={{ background: "var(--bg-secondary)" }}>
        <EyebrowLabel color="var(--text-body-subtle)">{t("rapport.mene_titre", locale)}</EyebrowLabel>
        <p className="mt-1.5 text-[15px] font-semibold text-text-heading">
          {qui === "lui"
            ? t("rapport.mene_toi", locale)
            : remplir(t("rapport.mene_autre", locale), { nom: nomAutre })}
        </p>
        <p className="mt-1 text-[11px] leading-snug text-text-body-subtle">
          {remplir(t("rapport.mene_aide", locale), { n: confiance })}
        </p>
      </div>
    </Section>
  );
}

/**
 * Ce qu on garde. Le partage ne porte pas la note : la recherche sur la
 * presentation de soi dit qu on partage ce qui nous met en valeur, donc un
 * produit qui ne se partage que quand il flatte devient un produit qui flatte.
 * On partage le terrain le plus fort que les deux ont en commun — vrai quel que
 * soit le score, et lisible par un tiers en deux secondes.
 */
function Commun({
  lecture,
  locale,
  nomAutre,
  nomMoi,
}: {
  lecture: LectureMatch;
  locale: Locale;
  nomAutre: string;
  nomMoi: string;
}) {
  const [partage, setPartage] = useState(false);

  // Le terrain ou les DEUX pesent : on classe sur le plus faible des deux, pas
  // sur la somme. Une somme elevee peut ne venir que d une seule personne.
  const commun = useMemo(
    () => [...lecture.porteurs].sort((a, b) => Math.min(b.lui, b.elle) - Math.min(a.lui, a.elle))[0],
    [lecture.porteurs],
  );

  const surPartage = useCallback(async () => {
    if (!commun) return;
    toucher();
    const texte = `${nomMoi} + ${nomAutre} — ${t(commun.clef, locale)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Favorable", text: texte });
        reussi();
        setPartage(true);
        setTimeout(() => setPartage(false), 2000);
        return;
      }
      await navigator.clipboard.writeText(texte);
      reussi();
      setPartage(true);
      setTimeout(() => setPartage(false), 2000);
    } catch {
      /* annule par la personne : rien a dire, l ecran n a pas bouge */
    }
  }, [commun, locale, nomAutre, nomMoi]);

  if (!commun) return null;

  return (
    <Section className="pb-8" delai={0.05}>
      <div
        className="rounded-2xl p-5 text-center"
        style={{ background: "var(--bg-premium)", color: "var(--text-on-premium)" }}
      >
        <EyebrowLabel color="var(--text-on-premium)">{t("rapport.partage_titre", locale)}</EyebrowLabel>
        <p className="mt-2 text-[20px] font-semibold leading-tight">{t(commun.clef, locale)}</p>
        <p className="mt-1.5 text-[12px] leading-snug opacity-80">{t(`${commun.clef}_aide`, locale)}</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <Anneau lettre={nomMoi} taille={28} />
          <Anneau lettre={nomAutre} taille={28} doux />
        </div>
        <button
          type="button"
          onClick={surPartage}
          className="mt-4 rounded-full px-5 py-2.5 text-[14px] font-semibold"
          style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
        >
          {partage ? t("rapport.partage_en_cours", locale) : t("rapport.partage_bouton", locale)}
        </button>
        <p className="mt-2.5 text-[11px] leading-snug opacity-75">
          {t("rapport.partage_aide", locale)}
        </p>
      </div>
    </Section>
  );
}

/**
 * La methode, depliable et fermee par defaut. Fermee parce qu elle n est pas le
 * sujet ; presente parce que son absence est exactement ce qu on reproche a tout
 * le marche.
 */
function Methode({ locale }: { locale: Locale }) {
  const [ouvert, setOuvert] = useState(false);
  return (
    <Section className="pb-4" delai={0.05}>
      <button
        type="button"
        onClick={() => {
          toucher();
          setOuvert((o) => !o);
        }}
        aria-expanded={ouvert}
        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
        style={{ background: "var(--surface-light)" }}
      >
        <span className="text-[13px] font-semibold text-text-heading">
          {t("rapport.methode_titre", locale)}
        </span>
        <span className="text-[13px] text-text-body-subtle" aria-hidden="true">
          {ouvert ? "−" : "+"}
        </span>
      </button>
      {ouvert ? (
        <div className="space-y-2.5 px-4 pt-3">
          <p className="text-[12px] leading-relaxed text-text-body">
            {t("rapport.methode_calcul", locale)}
          </p>
          <p className="text-[12px] leading-relaxed text-text-body">
            {t("rapport.methode_pretend", locale)}
          </p>
          <p className="text-[11px] leading-relaxed text-text-body-subtle">
            {t("rapport.methode_source", locale)}
          </p>
        </div>
      ) : null}
    </Section>
  );
}
