"use client";

/**
 * Le guide de premiere utilisation.
 *
 * REECRIT LE 1er SEPTEMBRE 2026. L ancien mentait sur l interface qu il
 * expliquait : son premier pas disait « cette ligne marque aujourd hui », alors
 * que l unique ligne horizontale est un CURSEUR DE LECTURE — il affiche l age
 * de ce qu on regarde et change a chaque defilement. La phrase etait vraie une
 * seconde, puis fausse pour toujours. Un guide qui se trompe sur sa propre app
 * detruit la confiance dans tout le reste.
 *
 * Trois principes gouvernent cette version.
 *
 * 1. ON MESURE, ON NE DEVINE PAS. L ancien posait son halo a « 55 % » de
 *    largeur et 280 pixels de rayon, ecrits en dur. Ici chaque cible est
 *    resolue par getBoundingClientRect() sur un attribut data-guide, apres que
 *    la mise en page s est stabilisee.
 *
 * 2. AUCUNE COULEUR FIGEE. L ancien peignait un voile presque noir par-dessus
 *    une app claire, et son sous-titre tombait a 1,73 de contraste. Tout vient
 *    des jetons, donc tout suit le theme.
 *
 * 3. LISIBLE A L ARRET. La fleche flottante d avant portait du sens par son
 *    mouvement ; figee par « Reduire les animations », elle devenait un
 *    triangle decoratif qui ne designait plus rien. Ce qui designe ici est le
 *    trou et son anneau : deux formes statiques.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { t, detectLocale, isRTL } from "@/lib/i18n-demo";

const CLE_FAIT = "unfold_first_use_done";
const CLE_ESSAIS = "unfold_first_use_essais";
const CLE_ACCUEIL = "unfold_timeline_welcomed";

/** Au-dela, la personne a repondu : elle ne veut pas du guide. */
const CLE_RELANCE = "unfold_first_use_relance";
const ESSAIS_MAX = 3;

type Pas = {
  /**
   * Selecteur CSS de ce que le pas designe, resolu dans le conteneur.
   *
   * C etait `string | null`, ou null voulait dire « l union de TOUS les
   * data-guide ». Piege : le sens du pas dependait alors du nombre de reperes
   * poses ailleurs dans l app. Il n en existait que deux, aux extremites, donc
   * l union etait un grand rectangle vide. Un pas doit nommer sa cible.
   */
  selecteur: string;
  titre: string;
  corps: string;
  carte: "haut" | "bas";
};

type Rect = { top: number; left: number; width: number; height: number };

/**
 * Faut-il montrer le guide ?
 *
 * La porte est aussi importante que le contenu : un guide qui s impose au
 * mauvais moment designe le vide. Chaque condition vient d un cas reel.
 */
export function shouldShowFirstUseGuide(ctx?: {
  vue?: string;
  aDesDonnees?: boolean;
  chargementViager?: boolean;
  ficheOuverte?: boolean;
}): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(CLE_FAIT)) return false;
    // L accueil doit etre passe : sinon deux voiles se succedent.
    if (localStorage.getItem(CLE_ACCUEIL) !== "true") return false;
    if (Number(localStorage.getItem(CLE_ESSAIS) ?? 0) >= ESSAIS_MAX) return false;
  } catch {
    return false;
  }
  // La vue liste n a ni curseur d age ni capsules graphiques : le guide y
  // pointerait le vide. Et le mode est restaure depuis le stockage, donc on
  // peut tres bien arriver directement en liste.
  if (ctx?.vue && ctx.vue !== "overview") return false;
  if (ctx?.aDesDonnees === false) return false;
  // Pendant le chargement de la vie entiere, les positions des capsules sont
  // rebattues : mesurer maintenant, c est ancrer sur des coordonnees perimees.
  if (ctx?.chargementViager) return false;
  if (ctx?.ficheOuverte) return false;
  return true;
}

export function marquerGuideVu() {
  try {
    localStorage.setItem(CLE_FAIT, "1");
  } catch {
    /* stockage refuse */
  }
}

/** Remet le guide a zero — appele depuis l ecran profil. */
/**
 * Demande de rejouer le guide, depuis le tiroir de profil.
 *
 * Effacer « guide fait » et « refus » ne suffisait PAS, et c est ce qui rendait
 * le bouton inerte : le guide n est monte que dans le `onDone` de l ecran
 * d accueil, c est-a-dire au seul moment ou cet ecran se termine. Or l accueil
 * ne se rejoue pas — `unfold_timeline_welcomed` reste pose. Le `onDone` ne
 * partait donc jamais, et « revoir le guide » ouvrait la timeline sans rien
 * declencher.
 *
 * On pose desormais une demande explicite, que la timeline lit a son montage.
 * Le guide ne depend plus d un evenement qui ne peut plus se produire.
 */
export const EVENEMENT_RELANCE = "unfold:rejouer-guide";

export function rejouerGuide() {
  try {
    localStorage.removeItem(CLE_FAIT);
    localStorage.removeItem(CLE_ESSAIS);
    localStorage.setItem(CLE_RELANCE, "1");
  } catch {
    /* stockage refuse */
  }
  // On PREVIENT, on ne se contente pas de deposer une demande.
  //
  // La premiere correction posait la demande et laissait la timeline la lire a
  // son montage. Mais quand on appuie sur « revoir le guide » depuis le profil,
  // on est deja SUR la timeline : elle ne remonte pas, l effet de montage ne
  // rejoue pas, et rien ne se passe. Exactement la meme faute que celle qu on
  // venait de corriger — un declencheur suspendu a un evenement qui ne peut pas
  // survenir — deplacee d un cran.
  try {
    window.dispatchEvent(new CustomEvent(EVENEMENT_RELANCE));
  } catch {
    /* pas de fenetre */
  }
}

/** La timeline consomme la demande : une relance, une seule fois. */
export function relanceDemandee(): boolean {
  try {
    if (localStorage.getItem(CLE_RELANCE) !== "1") return false;
    localStorage.removeItem(CLE_RELANCE);
    return true;
  } catch {
    return false;
  }
}

export function FirstUseGuide({
  conteneur,
  onDone,
}: {
  /** Le panneau de la timeline, contre lequel les cibles sont mesurees. */
  conteneur?: React.RefObject<HTMLElement | null>;
  onDone: () => void;
}) {
  const locale = detectLocale();
  const rtl = isRTL(locale);
  const [pas, setPas] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [pasUtiles, setPasUtiles] = useState<Pas[] | null>(null);
  const compte = useRef(false);

  const TOUS: Pas[] = [
    {
      selecteur: '[data-guide="curseur-age"]',
      titre: t("guide.p1_titre", locale),
      corps: t("guide.p1_corps", locale),
      carte: "haut",
    },
    {
      // « Ta vie, de bas en haut » : la colonne entiere, donc toutes les
      // capsules visibles, pas deux reperes eloignes avec du vide entre eux.
      selecteur: '[data-guide="capsule"]',
      titre: t("guide.p2_titre", locale),
      corps: t("guide.p2_corps", locale),
      carte: "bas",
    },
    {
      selecteur: "[data-guide-courant]",
      titre: t("guide.p3_titre", locale),
      corps: t("guide.p3_corps", locale),
      carte: "bas",
    },
  ];

  /** Mesure une cible dans le repere du conteneur. */
  const mesurer = useCallback(
    (selecteur: string): Rect | null => {
      const hote = conteneur?.current;
      if (!hote) return null;
      const base = hote.getBoundingClientRect();

      const elements = Array.from(hote.querySelectorAll(selecteur));
      if (elements.length === 0) return null;

      let t0 = Infinity, l0 = Infinity, b0 = -Infinity, r0 = -Infinity;
      for (const el of elements) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        t0 = Math.min(t0, r.top); l0 = Math.min(l0, r.left);
        b0 = Math.max(b0, r.bottom); r0 = Math.max(r0, r.right);
      }
      if (!Number.isFinite(t0)) return null;

      const marge = 8;
      let largeur = r0 - l0 + marge * 2;
      let gauche = l0 - base.left - marge;
      // Les capsules font 14 a 28 points de large. Le guide dit « touche » : la
      // zone qu il designe doit etre atteignable, donc au moins 44.
      if (largeur < 44) {
        gauche -= (44 - largeur) / 2;
        largeur = 44;
      }

      let haut = t0 - base.top - marge;
      let hauteur = b0 - t0 + marge * 2;

      // Bornage au conteneur.
      //
      // La colonne defile : ses capsules debordent largement au-dessus et
      // au-dessous du panneau visible, et getBoundingClientRect rend leurs
      // coordonnees reelles, negatives comprises. Sans bornage, le trou
      // deborde, les quatre bandes du voile calculent des hauteurs negatives et
      // s effondrent — le voile disparait et l anneau sort de l ecran.
      //
      // On borne apres l elargissement a 44 : l ordre inverse pourrait
      // repousser la zone hors du panneau.
      const droite = Math.min(gauche + largeur, base.width);
      gauche = Math.max(0, gauche);
      largeur = Math.max(0, droite - gauche);

      const bas = Math.min(haut + hauteur, base.height);
      haut = Math.max(0, haut);
      hauteur = Math.max(0, bas - haut);

      if (largeur === 0 || hauteur === 0) return null;

      return { top: haut, left: gauche, width: largeur, height: hauteur };
    },
    [conteneur],
  );

  // On ne garde que les pas dont la cible existe. Un pas qui pointe le vide est
  // pire que pas de pas.
  useEffect(() => {
    const image = requestAnimationFrame(() => {
      const utiles = TOUS.filter((p) => mesurer(p.selecteur) !== null);
      if (utiles.length === 0) {
        marquerGuideVu();
        onDone();
        return;
      }
      setPasUtiles(utiles);
      if (!compte.current) {
        compte.current = true;
        try {
          localStorage.setItem(CLE_ESSAIS, String(Number(localStorage.getItem(CLE_ESSAIS) ?? 0) + 1));
        } catch {
          /* stockage refuse */
        }
      }
    });
    return () => cancelAnimationFrame(image);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Remesurer a chaque pas, et quand la fenetre change.
  useEffect(() => {
    if (!pasUtiles) return;
    const relever = () => {
      const p = pasUtiles[pas];
      setRect(p ? mesurer(p.selecteur) : null);
    };
    relever();
    window.addEventListener("resize", relever);
    window.addEventListener("orientationchange", relever);
    return () => {
      window.removeEventListener("resize", relever);
      window.removeEventListener("orientationchange", relever);
    };
  }, [pas, pasUtiles, mesurer]);

  if (!pasUtiles) return null;
  const courant = pasUtiles[pas];
  const dernier = pas === pasUtiles.length - 1;

  const terminer = () => {
    marquerGuideVu();
    onDone();
  };

  return (
    <div
      className="absolute inset-0 z-50"
      dir={rtl ? "rtl" : "ltr"}
      role="dialog"
      aria-label={t("guide.progression", locale)
        .replace("{n}", String(pas + 1))
        .replace("{total}", String(pasUtiles.length))}
    >
      {/* Le voile. Quatre bandes plutot qu un decoupage : le clip-path ne
          laisse pas passer les evenements de pointage de facon fiable dans la
          vue web d iOS, et on veut que le trou reste touchable. */}
      {rect
        ? (
          [
            { top: 0, left: 0, right: 0, height: Math.max(0, rect.top) },
            { top: rect.top + rect.height, left: 0, right: 0, bottom: 0 },
            { top: rect.top, left: 0, width: Math.max(0, rect.left), height: rect.height },
            { top: rect.top, left: rect.left + rect.width, right: 0, height: rect.height },
          ] as React.CSSProperties[]
        ).map((pos, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              ...pos,
              // La couleur de fond de l app, pas un noir plaque : c est ce qui
              // rend le voile juste dans les deux themes.
              // Voir --voile-guide dans globals.css : un projecteur assombrit,
              // il n efface pas. A 92 % de la couleur de fond, l app disparaissait
              // et l on ne savait plus ou l on etait.
              background: "var(--voile-guide)",
            }}
          />
        ))
        : (
          <div
            className="absolute inset-0"
            style={{ background: "var(--voile-guide)" }}
          />
        )}

      {/* L anneau. Il designe, a l arret, sans animation. */}
      {rect && (
        <div
          className="pointer-events-none absolute"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
            border: "1.5px solid var(--border-brand)",
            borderRadius: 14,
          }}
        />
      )}

      {/* La carte. Opaque : un fond translucide rendrait le contraste
          incalculable, et c est ainsi que l ancien sous-titre etait tombe a
          1,73. */}
      <div
        className="absolute rounded-2xl p-4"
        style={{
          left: 16,
          right: 16,
          ...(courant.carte === "haut"
            ? { top: "calc(var(--safe-top, 0px) + 40px)" }
            : { bottom: "calc(var(--barre-onglets, 64px) + var(--safe-bottom, 0px) + 16px)" }),
          background: "var(--bg-primary)",
          border: "1px solid var(--border-light)",
          boxShadow: "0 8px 32px rgb(0 0 0 / 0.18)",
        }}
      >
        <p className="text-base font-semibold" style={{ color: "var(--text-heading)" }}>
          {courant.titre}
        </p>
        <p className="mt-1.5 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
          {courant.corps}
        </p>

        <div className="mt-4 flex items-center gap-3">
          {/* Trois points : on doit savoir que ça dure trois taps, sinon on
              passe sans savoir ce qu on rate. */}
          <div className="flex gap-1.5" aria-hidden="true">
            {pasUtiles.map((_, i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: i === pas ? "var(--border-brand)" : "var(--border-light)",
                }}
              />
            ))}
          </div>
          <span className="flex-1" />
          <button
            type="button"
            onClick={terminer}
            className="px-2 text-sm font-medium"
            style={{ color: "var(--text-brand)", minHeight: 44 }}
          >
            {t("guide.passer", locale)}
          </button>
          <button
            type="button"
            onClick={() => (dernier ? terminer() : setPas((n) => n + 1))}
            className="rounded-xl px-5 text-sm font-semibold"
            style={{
              minHeight: 48,
              background: "var(--bg-brand-strong)",
              color: "var(--text-on-brand)",
              border: "1px solid var(--border-brand)",
            }}
          >
            {dernier ? t("guide.commencer", locale) : t("guide.suivant", locale)}
          </button>
        </div>
      </div>
    </div>
  );
}
