/**
 * Le retour dans la main.
 *
 * POURQUOI CE MODULE EXISTE
 *
 * L appel etait copie a deux endroits — la capsule de la timeline et le flou
 * premium — chacun avec sa propre garde et son propre `.catch(() => {})`. Une
 * troisieme copie allait naitre avec le balayage des connexions ; c est le
 * moment ou une habitude devient une regle, ou se perd.
 *
 * Sur iOS, le retour haptique n est pas un ornement : c est la moitie de la
 * confirmation. Un balayage qui s ouvre sans rien dans la main ne donne pas
 * l impression d avoir marche. C est exactement ce qui separe une page web
 * posee dans une coque d une application qu on croit native.
 *
 * LES QUATRE GESTES, ET QUAND LES EMPLOYER
 *
 *  - `toucher()`   : l element repond au doigt (une carte, une ligne).
 *  - `franchir()`  : un seuil est passe — un balayage s ouvre, un cran change.
 *  - `choisir()`   : la valeur selectionnee change (un segment, un curseur).
 *  - `reussi()`    : l action est allee au bout (connexion creee, envoi parti).
 *
 * Rien pour l echec : une erreur se dit avec des mots, pas avec une vibration
 * que personne ne sait interpreter.
 *
 * Hors application native — sur le web, dans un navigateur — ces fonctions ne
 * font rien et ne jettent rien. Le plugin est charge a la demande pour qu il
 * ne pese pas sur le premier rendu.
 */

import { isNative } from "@/lib/platform";

type Impact = "Light" | "Medium" | "Heavy";

function impact(style: Impact): void {
  if (!isNative()) return;
  import("@capacitor/haptics")
    .then(({ Haptics, ImpactStyle }) => Haptics.impact({ style: ImpactStyle[style] }))
    .catch(() => {});
}

/** L element repond au doigt. */
export function toucher(): void {
  impact("Light");
}

/** Un seuil vient d etre franchi : le balayage s ouvre, le cran change. */
export function franchir(): void {
  impact("Medium");
}

/** La valeur choisie change. Plus sec qu un impact, c est le geste d un picker. */
export function choisir(): void {
  if (!isNative()) return;
  import("@capacitor/haptics")
    .then(({ Haptics }) => Haptics.selectionChanged())
    .catch(() => {});
}

/** L action est allee au bout. */
export function reussi(): void {
  if (!isNative()) return;
  import("@capacitor/haptics")
    .then(({ Haptics, NotificationType }) => Haptics.notification({ type: NotificationType.Success }))
    .catch(() => {});
}
