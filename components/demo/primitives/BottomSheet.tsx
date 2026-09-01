"use client";

import { useEffect, useId, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Max height as CSS value (default: "85%") */
  maxHeight?: string;
  /**
   * Autorise cette feuille a s ouvrir PAR-DESSUS une autre au lieu de la
   * fermer. A ne declarer que si le contexte du dessous doit rester visible —
   * une confirmation destructrice, par exemple. Voir `fermerCellesDuDessous`.
   */
  empilable?: boolean;
}

/* ==========================================================================
   REGISTRE DES FEUILLES OUVERTES

   POURQUOI un registre au niveau du module plutot que la discipline des
   appelants : l empilement s est deja produit dans ce depot (ProfileDrawer
   monte le tiroir et le choix de langue en freres, tous deux ouvrables en meme
   temps). Tant que chaque feuille se croit seule, chacune ecoute le clavier,
   chacune reclame le foyer, chacune verrouille et deverrouille le fond : deux
   feuilles ouvertes se marchent dessus, et l utilisateur se retrouve a fermer
   des fenetres qu il n a pas ouvertes.

   CHOIX RETENU : le registre ne REFUSE pas la seconde ouverture. Refuser
   voudrait dire ne rien afficher apres un geste de l utilisateur — une panne
   silencieuse, pire que l empilement — et les appelants qui empilent sont hors
   du perimetre de ce chantier. Le registre rend donc l empilement VISIBLE
   (avertissement en developpement) et INOFFENSIF :

     - une SEULE feuille repond au clavier, au geste de retour et au bouton
       materiel : celle du dessus ;
     - le foyer n est piege que par celle du dessus ;
     - le verrou du fond est compte : la premiere feuille verrouille, la
       derniere deverrouille. Fermer la feuille du dessus ne rend donc pas le
       defilement au fond alors qu une feuille est encore ouverte.

   Le jour ou les appelants ne montent plus qu une feuille a la fois,
   `avertirEmpilement` cessera simplement de se declencher.
   ========================================================================== */

type FeuilleOuverte = { id: string; fermer: () => void };

const pile: FeuilleOuverte[] = [];

/** Les zones defilables des feuilles ouvertes — voir `bloquerFond`. */
const zonesDefilables = new Set<HTMLElement>();

/** Debordement du corps avant verrouillage, pour le rendre intact ensuite. */
let debordementAvant: string | null = null;

/**
 * Le fond ne defile pas sous une feuille ouverte.
 *
 * POURQUOI un ecouteur et pas seulement `body { overflow: hidden }` : dans
 * cette application le corps ne defile PAS. Ce qui defile est le conteneur
 * `overflow-y-auto` du cadre, dans app/app/layout.tsx. Verrouiller le corps
 * seul ne bloquerait donc rien sur telephone. On empeche le geste a la source :
 * tout `touchmove` (et toute molette) dont la cible n est pas dans la zone
 * defilable d une feuille ouverte est annule. Le verrou du corps est garde en
 * plus, pour la mise en page web ou le corps peut defiler.
 */
function bloquerFond(e: Event) {
  const cible = e.target as Node | null;
  if (cible) {
    for (const zone of zonesDefilables) {
      if (zone.contains(cible)) return;
    }
  }
  e.preventDefault();
}

/**
 * UNE SEULE FEUILLE A LA FOIS — et c est le composant qui s en charge.
 *
 * Le registre se contentait d avertir en console. C etait deja utile : il a
 * attrape, sur la timeline, la feuille de vente restee ouverte sous le centre
 * de messages. Mais un avertissement que seul un developpeur voit ne corrige
 * rien pour la personne devant l ecran, qui se retrouve avec deux surfaces
 * superposees et deux choses a fermer.
 *
 *   « foutre 25 fenetres a cliquer pour les closer c est pas de l UX, c est de
 *     la punition pour user »  — Christophe, 01/09/2026
 *
 * A l ouverture, on ferme donc ce qui est dessous. C est la regle par defaut
 * parce que c est ce que veut dire « une seule a la fois », et parce que tous
 * les appelants de ce depot qui empilent le font par accident : le tiroir de
 * profil et son selecteur de langue sont deux feuilles soeurs, la feuille de
 * vente et le centre de messages aussi. Aucun n a besoin de superposition.
 *
 * `empilable` reste pour le cas ou une feuille doit VRAIMENT s ouvrir par-dessus
 * une autre — une confirmation destructrice, par exemple, qui perdrait son sens
 * si le contexte disparaissait derriere. Il faut alors le declarer, donc
 * l assumer.
 */
function fermerCellesDuDessous() {
  // Copie : `fermer()` provoque un depilage pendant qu on parcourt.
  for (const f of [...pile]) f.fermer();
}

function empiler(id: string, fermer: () => void, empilable: boolean) {
  if (pile.some((f) => f.id === id)) return;
  if (pile.length > 0 && !empilable) fermerCellesDuDessous();
  pile.push({ id, fermer });
  if (pile.length === 1 && typeof document !== "undefined") {
    debordementAvant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Non passif : sinon le navigateur ignore preventDefault sur touchmove.
    document.addEventListener("touchmove", bloquerFond, { passive: false });
    document.addEventListener("wheel", bloquerFond, { passive: false });
  }
}

function depiler(id: string) {
  const i = pile.findIndex((f) => f.id === id);
  if (i === -1) return;
  pile.splice(i, 1);
  if (pile.length === 0 && typeof document !== "undefined") {
    document.body.style.overflow = debordementAvant ?? "";
    debordementAvant = null;
    document.removeEventListener("touchmove", bloquerFond);
    document.removeEventListener("wheel", bloquerFond);
  }
}

function estDessus(id: string) {
  return pile[pile.length - 1]?.id === id;
}

/* --------------------------------------------------------------------------
   RETOUR ARRIERE

   Le geste de retour iOS (glissement depuis le bord gauche dans la WebView) et
   le bouton materiel Android font tous les deux, par defaut, un
   `history.back()`. La feuille n ecoutait qu Escape : le retour NAVIGUAIT —
   l utilisateur quittait l ecran en laissant la feuille derriere lui, ou
   sortait de l application. On empile donc une entree d historique factice a
   l ouverture. Le retour consomme CETTE entree, et la feuille se ferme sans
   que la navigation bouge.

   L etat de Next est recopie dans la nouvelle entree (`...history.state`) :
   ecraser `__NA` et l arbre interne du routeur ferait recharger la page
   entiere au retour.
   -------------------------------------------------------------------------- */

const MARQUE = "feuilleFavorable";

/**
 * Nombre de `history.back()` que NOUS avons declenches et dont le `popstate`
 * n est pas encore arrive. Sans ce compteur, fermer la feuille du dessus par un
 * bouton retirerait son entree, et le `popstate` qui en resulte fermerait aussi
 * la feuille du dessous.
 */
let retoursProgrammes = 0;

/**
 * Shared BottomSheet primitive — backdrop + spring slide + drag handle.
 * Fermeture par Escape, par le geste de retour et par le bouton materiel ;
 * fond verrouille ; foyer clavier piege puis rendu a l element d origine.
 */
export function BottomSheet({ open, onClose, children, maxHeight = "85%", empilable = false }: BottomSheetProps) {
  const id = useId();
  const panneauRef = useRef<HTMLDivElement | null>(null);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const foyerAvantRef = useRef<HTMLElement | null>(null);

  // POURQUOI une reference plutot que la fonction en dependance : les appelants
  // passent presque tous une fonction flechee ecrite sur place, donc une
  // identite neuve a chaque rendu. Mettre `onClose` en dependance rejouerait
  // les effets ci-dessous a chaque rendu — et celui de l historique empilerait
  // une entree par rendu.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // 1. Registre + verrou du fond.
  useEffect(() => {
    if (!open) return;
    const zone = zoneRef.current;
    if (zone) zonesDefilables.add(zone);
    // La fonction de fermeture passe par la reference : les appelants ecrivent
    // presque tous une fonction flechee sur place, et le registre garderait
    // sinon une identite perimee.
    empiler(id, () => onCloseRef.current(), empilable);
    return () => {
      depiler(id);
      if (zone) zonesDefilables.delete(zone);
    };
  }, [open, id, empilable]);

  // 2. Entree d historique factice : le retour ferme la feuille.
  useEffect(() => {
    if (!open || typeof window === "undefined") return;

    let fermeeParRetour = false;
    window.history.pushState({ ...window.history.state, [MARQUE]: id }, "");

    const surRetour = () => {
      // Retour que nous avons declenche nous-memes en refermant une feuille :
      // il ne doit fermer personne d autre.
      if (retoursProgrammes > 0) {
        retoursProgrammes -= 1;
        return;
      }
      if (!estDessus(id)) return;
      fermeeParRetour = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", surRetour);
    return () => {
      window.removeEventListener("popstate", surRetour);
      if (fermeeParRetour) return;
      // Fermeture par un bouton ou par le voile : notre entree est encore la,
      // il faut la retirer, sinon un retour plus tard serait avale dans le
      // vide. On ne recule QUE si l entree courante est bien la notre : si une
      // vraie navigation a eu lieu depuis, reculer la defairait.
      if (window.history.state?.[MARQUE] === id) {
        retoursProgrammes += 1;
        window.history.back();
      }
    };
  }, [open, id]);

  // 3. Foyer clavier : pris a l ouverture, piege tant que la feuille est
  //    ouverte, rendu a l element qui l a ouverte a la fermeture. Sans cela la
  //    tabulation part derriere la feuille, sur des controles qu elle recouvre.
  //    C est aussi ce qu attend une presentation modale iOS.
  useEffect(() => {
    if (!open || typeof document === "undefined") return;

    foyerAvantRef.current = document.activeElement as HTMLElement | null;

    const panneau = panneauRef.current;
    // On ne prend le foyer que s il n est pas deja dans la feuille : plusieurs
    // feuilles ont un champ en `autoFocus`, et React l a deja applique ici.
    if (panneau && !panneau.contains(document.activeElement)) {
      panneau.focus({ preventScroll: true });
    }

    const surTouche = (e: KeyboardEvent) => {
      if (!estDessus(id)) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key !== "Tab") return;

      const p = panneauRef.current;
      if (!p) return;
      const cibles = focusables(p);
      if (cibles.length === 0) {
        e.preventDefault();
        p.focus({ preventScroll: true });
        return;
      }
      const premier = cibles[0];
      const dernier = cibles[cibles.length - 1];
      const actif = document.activeElement;

      if (!p.contains(actif)) {
        e.preventDefault();
        (e.shiftKey ? dernier : premier).focus({ preventScroll: true });
      } else if (e.shiftKey && actif === premier) {
        e.preventDefault();
        dernier.focus({ preventScroll: true });
      } else if (!e.shiftKey && actif === dernier) {
        e.preventDefault();
        premier.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("keydown", surTouche);
      const precedent = foyerAvantRef.current;
      foyerAvantRef.current = null;
      if (precedent && document.contains(precedent)) {
        precedent.focus({ preventScroll: true });
      }
    };
  }, [open, id]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={panneauRef}
            role="dialog"
            aria-modal="true"
            // -1 : le panneau peut recevoir le foyer par programme sans entrer
            // dans l ordre de tabulation.
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl bg-bg-primary"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{
              maxHeight,
              boxShadow: "0 -4px 24px rgba(0,0,0,0.12)",
              // Le panneau recoit le foyer a l ouverture : pas de cerne dessus.
              // Ce n est pas un changement d apparence, c est ce qui garantit
              // que l apparence ne change pas.
              outline: "none",
            }}
          >
            {/* Drag handle */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-8 rounded-full" style={{ background: "var(--border-base)" }} />
            </div>

            {/* Content */}
            <div
              ref={zoneRef}
              className="flex-1 overflow-y-auto scrollbar-none"
              style={{
                paddingBottom: "var(--safe-bottom, 0px)",
                // Le defilement s arrete au bout de la feuille au lieu de se
                // propager au conteneur du cadre, derriere elle.
                overscrollBehavior: "contain",
              }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const SELECTEUR_FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

function focusables(racine: HTMLElement): HTMLElement[] {
  return Array.from(racine.querySelectorAll<HTMLElement>(SELECTEUR_FOCUSABLE)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0,
  );
}
