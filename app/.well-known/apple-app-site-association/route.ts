import { NextResponse } from "next/server";

/**
 * Universal Links iOS — servi en clair sur https://favorable.day/.well-known/apple-app-site-association
 *
 * Sans ce fichier, taper un lien https://favorable.day/app/invite/join?...
 * sur un iPhone qui a DEJA l app installee ouvre Safari au lieu de l app
 * native. La page s execute alors dans le stockage du navigateur
 * (localStorage/IndexedDB de Safari), jamais vu par capacitor://localhost :
 * elle croit donc que la personne n est pas onboardee et la renvoie vers un
 * nouvel onboarding au lieu de la connecter dans son app existante. C est la
 * cause du partage par lien casse, alors que le code saisi a la main (qui ne
 * quitte jamais l app) fonctionne.
 *
 * "LD9N97K83G" est le Team ID Apple lu dans
 * ios/App/App.xcodeproj/project.pbxproj (DEVELOPMENT_TEAM), le meme sur les
 * quatre configurations Debug/Release des cibles App et FavorableWidget.
 * "day.favorable.app" est le PRODUCT_BUNDLE_IDENTIFIER de la cible App (pas
 * celui du widget, qui porte le suffixe .widget).
 *
 * Cote Xcode : ios/App/App/App.entitlements porte desormais
 * com.apple.developer.associated-domains = ["applinks:favorable.day"].
 * Reste a activer la capacite "Associated Domains" dans Signing &
 * Capabilities si Xcode ne l a pas reprise automatiquement de l entitlements
 * (regeneration de profil de provisionnement) — geste qu il ne se fait
 * qu au compte developpeur d Apple de Christophe.
 *
 * "paths" ne filtre que le CHEMIN de l URL, jamais la chaine de requete :
 * "?name=...&code=..." n a donc pas besoin d etre liste. Le trailingSlash
 * (config native, jamais celle qui sert ce fichier — voir plus bas) n
 * intervient pas non plus : ce fichier n est JAMAIS embarque dans le build
 * natif (output: "export"), il ne repond que depuis le vrai deploiement web
 * de favorable.day, seul endroit qu iOS interroge pour les Universal Links.
 */
export async function GET() {
  const appId = "LD9N97K83G.day.favorable.app";

  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: appId,
          appIDs: [appId],
          paths: ["/app/invite/join", "/app/invite/join/*"],
        },
      ],
    },
  };

  // Content-Type explicite : le daemon Apple (swcutil) accepte du JSON sans
  // extension mais reste pointilleux sur l en-tete ; NextResponse.json() pose
  // "application/json" par defaut, on le laisse faire.
  return NextResponse.json(body, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}

// Rien ici ne depend de la requete : contenu identique a chaque appel. En
// mode export statique ce fichier est mis de cote par scripts/build-native.sh
// (il n a aucun sens dans un binaire embarque), mais en deploiement web
// normal (Vercel, sans NEXT_PUBLIC_NATIVE) ce marqueur permet a Next de le
// pre-generer comme une reponse statique plutot que de le recalculer a
// chaque requete.
export const dynamic = "force-static";
