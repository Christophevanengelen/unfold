/**
 * Les codes d acces au graphique de vie.
 *
 * Ce fichier existe parce que la meme fonction etait recopiee dans trois
 * fichiers — app/unlock, l ecran de prix et le teaser du site — et que les
 * trois se trompaient de la meme facon.
 *
 * L ETAT REEL, constate le 01/09/2026 : NEXT_PUBLIC_CHART_COUPONS n est defini
 * dans AUCUN environnement Vercel. La liste des codes valides est donc vide
 * partout, et les trois champs refusent tous les codes, tout le temps.
 *
 * Le probleme n est pas qu ils refusent, c est CE QU ILS DISENT en refusant :
 * « Invalid code — check spelling and try again. » Quelqu un a qui on a donne
 * un code s entend repondre qu il l a mal tape, reessaie, et se croit fautif.
 * L application accuse la personne d une panne qui lui appartient.
 *
 * D ou les trois etats distincts ci-dessous : « inactif » n est pas « inconnu »,
 * et la personne merite de savoir lequel des deux la concerne.
 *
 * Note pour plus tard : le prefixe NEXT_PUBLIC_ met la valeur dans le paquet
 * javascript envoye a chaque visiteur. Si des codes sont un jour definis ainsi,
 * n importe qui pourra les lire dans les outils de developpement du navigateur.
 * Un code distribue a quelques proches ne doit pas passer par une variable
 * NEXT_PUBLIC_ ; il faut une verification cote serveur.
 */

import { apiFetch } from "@/lib/api-client";

export type EtatCode = "ok" | "inconnu" | "inactif";

export const CLE_ACCES = "unfold_chart_access";

/**
 * Demande au SERVEUR ce que vaut un code.
 *
 * La liste vivait ici, lue depuis `NEXT_PUBLIC_CHART_COUPONS` — donc envoyee a
 * chaque visiteur dans le paquet javascript. Le jour ou des codes y auraient
 * ete definis, il aurait suffi d ouvrir les outils de developpement pour les
 * lire tous. Elle est passee cote serveur : voir app/api/coupons/verifier.
 *
 * `apiFetch` et non `fetch` : dans l app native l origine est
 * `capacitor://localhost`, ou un chemin relatif n aboutit nulle part et echoue
 * en silence. C est le defaut recurrent de ce depot.
 *
 * Un echec reseau rend « inactif » et non « inconnu » : on ne dit pas a
 * quelqu un que son code est faux quand on n a simplement pas pu le verifier.
 */
export async function verifierCode(saisi: string): Promise<EtatCode> {
  try {
    const res = await apiFetch("/api/coupons/verifier", {
      method: "POST",
      body: JSON.stringify({ code: saisi }),
    });
    if (!res.ok) return "inactif";
    const donnees = (await res.json()) as { etat?: EtatCode };
    return donnees.etat ?? "inactif";
  } catch {
    return "inactif";
  }
}
