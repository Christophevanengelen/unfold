"use client";

/**
 * La hauteur du clavier, en pixels, en temps reel.
 *
 * ─── LE DEFAUT QU IL CORRIGE ────────────────────────────────────────────────
 *
 * Christophe, le 17/09 : « le formulaire dans les parametres n est pas une
 * bonne UX, on voit pas ce qu on tape, le clavier vient par-dessus, surtout
 * pour le lieu de naissance ».
 *
 * La cause tient en une ligne de `capacitor.config.ts` :
 *
 *     resize: KeyboardResize.None   // « keeps 100dvh stable »
 *
 * Avec ce reglage, la WebView ne bouge PAS quand le clavier s ouvre. Il se pose
 * simplement par-dessus la page. Rien ne defile, rien ne se decale, et le champ
 * qu on est en train de remplir disparait dessous. Pour le lieu de naissance
 * c est pire encore : la liste des villes proposees s ouvre SOUS le champ,
 * donc entierement sous le clavier.
 *
 * ─── POURQUOI ON NE CHANGE PAS CE REGLAGE ───────────────────────────────────
 *
 * `KeyboardResize.Native` reglerait le probleme d un coup — et casserait tous
 * les ecrans construits sur `100dvh`, c est-a-dire la frise, les feuilles, la
 * barre d onglets. Le commentaire d origine n avait pas tort : il resolvait un
 * vrai probleme, il en creait un autre.
 *
 * On garde donc `None` et on gere le decalage nous-memes, la ou il compte :
 * dans les feuilles et les formulaires. C est aussi ce que font les apps natives
 * bien faites — elles ne redimensionnent pas tout, elles remontent ce qu il
 * faut.
 *
 * ─── DEUX SOURCES, PARCE QUE DEUX MONDES ────────────────────────────────────
 *
 *  - Dans l app, `@capacitor/keyboard` annonce la hauteur AVANT l animation
 *    (`keyboardWillShow`), ce qui permet de remonter en meme temps que le
 *    clavier plutot qu apres lui.
 *  - Sur le web, `visualViewport` donne la meme information : la difference
 *    entre la hauteur de la fenetre et celle du viewport visible.
 *
 * Sans l un ni l autre — un vieux navigateur — la fonction rend 0 et rien ne
 * bouge : l ecran reste exactement ce qu il etait.
 */

import { useEffect, useState } from "react";
import { isNative } from "@/lib/platform";

export function useClavier(): number {
  const [hauteur, setHauteur] = useState(0);

  useEffect(() => {
    let vivant = true;
    const poser = (h: number) => {
      if (vivant) setHauteur(Math.max(0, Math.round(h)));
    };

    if (isNative()) {
      const abonnements: { remove: () => void }[] = [];
      void (async () => {
        try {
          const { Keyboard } = await import("@capacitor/keyboard");
          // `willShow` et non `didShow` : on remonte PENDANT l animation du
          // clavier, pas apres. Sinon le champ saute une fois le clavier pose.
          abonnements.push(
            await Keyboard.addListener("keyboardWillShow", (info) => poser(info.keyboardHeight)),
          );
          abonnements.push(await Keyboard.addListener("keyboardWillHide", () => poser(0)));
        } catch {
          /* plugin absent : on ne bouge rien, ce qui est le comportement actuel */
        }
      })();
      return () => {
        vivant = false;
        for (const a of abonnements) a.remove();
      };
    }

    const vv = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vv) return () => { vivant = false; };

    const mesurer = () => {
      // Ce que le clavier mange : la hauteur de la fenetre moins celle du
      // viewport visible, moins ce dont on a deja defile.
      poser(window.innerHeight - vv.height - vv.offsetTop);
    };
    mesurer();
    vv.addEventListener("resize", mesurer);
    vv.addEventListener("scroll", mesurer);
    return () => {
      vivant = false;
      vv.removeEventListener("resize", mesurer);
      vv.removeEventListener("scroll", mesurer);
    };
  }, []);

  return hauteur;
}

/**
 * Amene un champ au-dessus du clavier, apres son ouverture.
 *
 * `scrollIntoView` seul ne suffit pas : au moment du `focus`, le clavier n est
 * pas encore la et le navigateur calcule sur l ancienne hauteur. On attend donc
 * la duree de son animation — 300 ms sur iOS — avant de recadrer.
 *
 * `block: "center"` et non `"nearest"` : un champ colle au bord haut du clavier
 * est techniquement visible et pratiquement illisible, surtout quand une liste
 * de suggestions doit s ouvrir dessous.
 */
export function amenerAuDessusDuClavier(element: HTMLElement | null, delaiMs = 320): void {
  if (!element) return;
  window.setTimeout(() => {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
  }, delaiMs);
}
