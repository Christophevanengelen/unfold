import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Source assets (not part of the app)
    "ressources/**",
    "design systhem/**",
    // Sorties de build natif : Capacitor recopie l export statique dedans.
    // Linter ces fichiers, c est linter le compilateur — 7800 avertissements
    // qui noient les vrais, et qui reapparaissent a chaque `cap sync`.
    "ios/**",
    "android/**",
    // Bibliotheques minifiees embarquees telles quelles.
    "**/*.min.js",
    // Fichiers temporaires des scripts de verification.
    "scripts/.*.tmp.*",
  ]),
  {
    rules: {
      /**
       * `set-state-in-effect` : avertissement, pas erreur. Plafonne a 13.
       *
       * La regle est juste en general : poser un etat en tete d effet provoque
       * un rendu en cascade, et la plupart du temps la valeur pouvait etre
       * calculee au rendu.
       *
       * Elle a tort dans cette app-ci, et pour une raison structurelle : on
       * livre en EXPORT STATIQUE. Chaque page est pre-rendue au build, sans
       * fenetre ni stockage local. Les treize cas signales lisent tous quelque
       * chose qui n existe que dans le navigateur — `localStorage`, la barre
       * d adresse, une donnee de naissance. Les poser a l initialisation de
       * l etat donnerait un premier rendu client different du HTML pre-rendu :
       * une divergence d hydratation, soit exactement le defaut que le
       * `useEffect` evite.
       *
       * CE QU IL NE FAUT PAS FAIRE, parce que je l ai fait le 17/09 avant de
       * revenir en arriere : envelopper le corps dans `void (async () => {})()`
       * pour que la regle ne le voie plus. Sans `await` dedans, le corps
       * s execute de facon synchrone — le contournement ne differe rien, il
       * aveugle seulement l analyseur. Et `setTimeout(..., 0)` differe pour de
       * bon, d une tache complete : l ecran peint alors une liste vide avant
       * celle qu on avait deja.
       *
       * Le compte est donc un plafond, tenu par scripts/verifier-lint.mjs. Un
       * quatorzieme cas fait echouer le CI ; un cas corrige abaisse le plafond.
       */
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
