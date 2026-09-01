/**
 * Verification d un code d acces, COTE SERVEUR.
 *
 * ─── POURQUOI CETTE ROUTE EXISTE ────────────────────────────────────────────
 *
 * La verification se faisait dans le navigateur, sur `NEXT_PUBLIC_CHART_COUPONS`.
 * Ce prefixe met la valeur dans le paquet javascript envoye a CHAQUE visiteur :
 * le jour ou des codes y auraient ete definis, n importe qui les aurait lus
 * dans les outils de developpement. Un code distribue a quelques proches
 * n aurait tenu que le temps qu une seule personne regarde.
 *
 * Le defaut n avait encore rien coute — la variable n est definie nulle part,
 * donc la liste est vide et les trois champs refusent tout depuis toujours.
 * C est justement pour ca qu il fallait le corriger AVANT de s en servir.
 *
 * ─── CE QUI CHANGE ──────────────────────────────────────────────────────────
 *
 * Les codes vivent desormais dans `CHART_COUPONS`, sans prefixe : la valeur
 * reste sur le serveur et n atteint jamais le navigateur. Le client envoie ce
 * qui a ete saisi, le serveur repond par l un des trois etats.
 *
 * ─── LES TROIS ETATS, ET POURQUOI ILS SONT TROIS ────────────────────────────
 *
 *   ok       le code est valide
 *   inconnu  le code ne correspond a rien
 *   inactif  AUCUN code n existe dans cet environnement
 *
 * « inactif » n est pas « inconnu ». Sans cette distinction, quelqu un a qui on
 * a donne un code s entend repondre qu il l a mal tape — l application accuse
 * la personne d une panne qui lui appartient.
 *
 * ─── CE QU ON NE DIT PAS ────────────────────────────────────────────────────
 *
 * La reponse ne contient jamais la liste des codes, ni leur nombre, ni un
 * indice de proximite. Une route de verification qui aide a deviner est une
 * route qui distribue.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export type EtatCode = "ok" | "inconnu" | "inactif";

function codesValides(): string[] {
  // Sans prefixe NEXT_PUBLIC_ : la valeur ne quitte pas le serveur.
  return (process.env.CHART_COUPONS ?? "")
    .split(",")
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

export async function POST(req: Request) {
  let saisi = "";
  try {
    const corps = (await req.json()) as { code?: unknown };
    saisi = typeof corps.code === "string" ? corps.code : "";
  } catch {
    // Corps illisible. On ne se distingue pas d un code inconnu : repondre
    // « requete malformee » apprendrait a un curieux qu il tape a la bonne
    // porte.
    return NextResponse.json({ etat: "inconnu" satisfies EtatCode });
  }

  const valides = codesValides();
  if (valides.length === 0) {
    return NextResponse.json({ etat: "inactif" satisfies EtatCode });
  }

  const etat: EtatCode = valides.includes(saisi.trim().toUpperCase()) ? "ok" : "inconnu";
  return NextResponse.json({ etat });
}
