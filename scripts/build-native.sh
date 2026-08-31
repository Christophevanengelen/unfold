#!/usr/bin/env bash
# Build natif : produit out/, le dossier que Capacitor embarque dans les binaires.
#
# Next.js ne sait pas exporter statiquement ce qui vit sur le serveur : routes
# d API, middleware, image de partage social, robots.txt, plan du site. Rien de
# tout cela n a sa place dans un binaire, c est le cas de n importe quelle app.
# On met ces fichiers de cote pendant la compilation et on les remet ensuite,
# meme si la compilation echoue.
#
# On ne supprime jamais rien.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

ECART=".native-build-aside"
mkdir -p "$ECART"

# chemin d origine -> nom dans le dossier de mise a l ecart
CHEMINS=(
  "app/api"
  "middleware.ts"
  # Toute la vitrine web : page d accueil, tarifs, mentions legales, retour de
  # connexion. Rien de tout cela ne va dans un binaire : l app commence a /app.
  "app/[locale]"
  "app/robots.ts"
  "app/sitemap.ts"
  "app/manifest.ts"
  # Adresse dynamique : l export statique ne peut pas produire un fichier par
  # identifiant de connexion. L app utilise /app/compatibility/view/?c=<id>,
  # qui affiche exactement le meme ecran (voir lib/connection-href.ts).
  "app/app/compatibility/[connectionId]"
  # Outil interne d exploration (connexion par mot de passe, cookie
  # astrolearn_session, pages chart/zr/profections/eclipses). Ce n est pas le
  # produit, et une zone protegee par mot de passe dans une app publique est un
  # motif de refus chez Apple. Reste disponible sur le web.
  "app/app/astro"
  # CMS interne. Meme raison : pas le produit, et pas sa place dans un binaire.
  "app/admin"
  "app/unlock"
)

ecarter() {
  for c in "${CHEMINS[@]}"; do
    if [ -e "$c" ]; then
      cible="$ECART/$(echo "$c" | tr '/' '~')"
      mv "$c" "$cible"
    fi
  done
}

restaurer() {
  for c in "${CHEMINS[@]}"; do
    cible="$ECART/$(echo "$c" | tr '/' '~')"
    if [ -e "$cible" ]; then
      mkdir -p "$(dirname "$c")"
      mv "$cible" "$c"
    fi
  done
  rmdir "$ECART" 2>/dev/null
  echo "  fichiers serveur remis en place"
}
trap restaurer EXIT INT TERM

echo "1/3  mise de cote de ce qui ne s exporte pas"
ecarter

echo "2/3  compilation de l export statique"
NEXT_PUBLIC_NATIVE=true npx next build
CODE=$?
[ $CODE -ne 0 ] && { echo "ECHEC de la compilation (code $CODE)"; exit $CODE; }

echo "3/3  page d entree et verification"
[ -d out ] || { echo "ECHEC : pas de dossier out"; exit 1; }

# Capacitor ouvre out/index.html. La vitrine web n etant pas embarquee,
# on pose une page d entree minimale qui bascule immediatement sur l app.
# Toujours ecraser : app/page.tsx est reste la page d accueil par defaut de
# create-next-app. Sur le web personne ne la voit, le middleware redirige vers
# /[locale]. Dans l app native il n y a pas de middleware, donc cette page
# devenait l ecran d ouverture. Constate sur l iPhone le 31 aout 2026.
cat > out/index.html <<'HTML'
<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Favorable</title>
<style>html,body{margin:0;height:100%;background:#1B1535}</style>
<script>
// Chemin ABSOLU : le serveur interne de Capacitor renvoie cette page pour toute
// adresse inconnue, donc un chemin relatif se rempile a chaque tour.
if (location.pathname !== "/app/index.html") { location.replace("/app/index.html"); }
</script>
</head>
<body></body>
</html>
HTML
echo "  page d entree posee : out/index.html vers ./app/"
NB=$(find out -type f | wc -l)
echo "  out/ contient $NB fichiers"
find out -maxdepth 2 -name "index.html" | head -5 | sed 's/^/  /'
echo "BUILD NATIF OK"
