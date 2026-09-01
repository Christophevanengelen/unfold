"use client";

/**
 * L ecran « aucune donnee » des rapports (Birthday Graph, Lifetime Chart,
 * Spirit Wave).
 *
 * Il existait en trois copies, une par rapport, avec chacune sa palette ecrite
 * en dur. Trois consequences, toutes reelles :
 *
 *   1. Les trois IGNORAIENT le theme choisi. Chacune imposait son fond, clair
 *      pour Birthday Graph, sombre pour les deux autres.
 *   2. La copie claire etait ILLISIBLE : #8C7FAE sur #F5F1FA donne un contraste
 *      de 3,27 quand le seuil est a 4,5. C est exactement la couleur qui avait
 *      ete corrigee dans app/globals.css — mais la correction centrale ne
 *      pouvait rien pour une valeur recopiee a la main. Les deux copies sombres,
 *      elles, etaient a 9,02 : le meme ecran, lisible deux fois sur trois.
 *   3. L ecran melangeait deux langues — titre anglais, bouton « Retour a
 *      Favorable » en francais — et renvoyait toujours vers /en.
 *
 * D ou les choix ici : tout vient des jetons, donc le theme est suivi et le
 * contraste est garanti des deux cotes. L accent par rapport (violet, or) est
 * abandonne au profit du jeton de marque : sur un ecran d erreur, etre lisible
 * compte plus que porter la couleur de la fonctionnalite.
 */

import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

export function EcranRapportVide({ nom }: { nom: string }) {
  const l = detectLocale();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        textAlign: "center",
      }}
    >
      <div>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "var(--text-brand)",
            marginBottom: 12,
          }}
        >
          {nom}
        </p>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "var(--text-heading)",
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {perso("vide.titre", l)}
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-body-subtle)", marginBottom: 24 }}>
          {perso("vide.sous", l).replace("{x}", nom)}
        </p>
        {/* La langue de la personne, pas /en en dur. */}
        <a
          href={`/${l}`}
          style={{
            display: "inline-block",
            background: "var(--bg-brand)",
            color: "var(--text-on-brand)",
            borderRadius: 50,
            padding: "12px 28px",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          {perso("vide.retour", l)}
        </a>
      </div>
    </div>
  );
}
