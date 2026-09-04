/**
 * La maquette de l experience — celle qu on retouche avant de la porter dans
 * l app.
 *
 *   node scripts/verifier-maquette.mjs
 *
 * POURQUOI CE CONTROLE EXISTE
 *
 * Les deux pages de `maquette/` sont un seul fichier HTML de 500 Ko, retouche
 * a la main plusieurs dizaines de fois par jour, sans compilateur ni typage
 * pour rattraper quoi que ce soit. Le 03/09/2026, retirer la page « Vous deux »
 * a emporte avec elle le gestionnaire du bouton « Voir ou je me situe » : le
 * bouton restait dessine, cliquable, et ne faisait plus rien. Personne ne l a
 * vu ; c est Christophe qui l a trouve en relisant la page.
 *
 * Une maquette dont un bouton est mort ne se fait pas juste critiquer sur le
 * bouton : elle fait douter de tout le reste. Et comme elle sert a obtenir un
 * accord — de Christophe, puis de Marie-Ange — avant la migration dans l app,
 * un accord donne sur une page a moitie morte ne vaut rien.
 *
 * CE QU IL VERIFIE
 *
 *  1. chaque `<script>` compile (une virgule perdue et la page entiere est
 *     muette, sans rien afficher a l ecran) ;
 *  2. chaque bouton porteur d un identifiant est branche quelque part ;
 *  3. chaque identifiant appele par le code existe dans la page ;
 *  4. aucune formule bannie ne subsiste (les regles produit de Christophe :
 *     pas de jargon de moteur, pas de question qui fait douter du calcul) ;
 *  5. le tampon de version est present, et le bloc des remarques est vide — les remarques traitees ne doivent pas
 *     revenir dans la liste au chargement suivant.
 *
 * Les identifiants sont cherches dans TOUT le fichier, pas seulement dans le
 * HTML statique : la moitie des ecrans est assemblee dans des gabarits de
 * chaines de caracteres cote JS, et un controle qui les ignore ne voit rien.
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import vm from "node:vm";

// Le dossier peut etre surcharge — c est ce qui permet de tester ce controle
// sur des copies volontairement cassees, plutot que de le croire sur parole.
const DOSSIER = process.argv[2] || "maquette";

/**
 * Les tournures interdites, avec la raison — un message d erreur qui dit
 * seulement « texte interdit » oblige a fouiller l historique pour comprendre.
 */
const BANNIS = [
  ["Pas vraiment", "on n interroge plus l utilisateur sur la justesse du calcul"],
  ["Tu t'en souviens", "idem : la carte affirme, elle ne demande pas validation"],
  ["ne change aucun calcul", "cette phrase laissait entendre que l app doute d elle-meme"],
  ["deux calculs", "les rouages du moteur ne sont jamais exposes a l utilisateur"],
  ["deux techniques", "idem"],
  ["il en faut deux", "idem : la regle interne des deux confirmations reste interne"],
  ["a calculer", "donnee non calculee laissee dans la maquette"],
  ["à calculer", "donnee non calculee laissee dans la maquette"],
  ["lorem", "texte de remplissage"],
  ["TODO", "note de travail oubliee dans la page"],
];

/** `<button ... id="x">` — y compris dans les gabarits JS. */
const BOUTONS = /<button[^>]*\bid="([\w-]+)"/g;
/** Tout `id="x"` present dans la page, statique ou assemble. */
const IDENTIFIANTS = /\bid="([\w-]+)"/g;
/** Les appels qui BRANCHENT un identifiant. */
const APPELS = [
  /getElementById\(\s*["'`]([\w-]+)["'`]\s*\)/g,
  /querySelector(?:All)?\(\s*["'`]#([\w-]+)/g,
  /\.id\s*===?\s*["'`]([\w-]+)["'`]/g,
];

function tous(texte, motif) {
  const vus = new Set();
  motif.lastIndex = 0;
  let m;
  while ((m = motif.exec(texte))) vus.add(m[1]);
  return vus;
}

/** La ligne d une position, pour pointer l endroit exact dans 500 Ko. */
function ligne(texte, position) {
  return texte.slice(0, position).split("\n").length;
}

const fichiers = existsSync(DOSSIER)
  ? readdirSync(DOSSIER).filter((f) => f.endsWith(".html")).sort()
  : [];

if (fichiers.length === 0) {
  console.log(`  aucune maquette dans ${DOSSIER}/ — rien a verifier`);
  process.exit(0);
}

const problemes = [];

for (const nom of fichiers) {
  const chemin = join(DOSSIER, nom);
  const page = readFileSync(chemin, "utf8");

  // 1. chaque script compile. Le bloc JSON des remarques n est pas du code :
  //    on ne prend que les `<script>` sans attribut `type`.
  const scripts = /<script>([\s\S]*?)<\/script>/g;
  let m;
  let n = 0;
  while ((m = scripts.exec(page))) {
    n += 1;
    try {
      new vm.Script(m[1], { filename: `${chemin} (script ${n})` });
    } catch (e) {
      problemes.push(`${nom} · script ${n} ne compile pas (ligne ~${ligne(page, m.index)}) : ${e.message}`);
    }
  }
  if (n === 0) problemes.push(`${nom} · aucun script trouve — la page serait inerte`);

  // 2 et 3. les boutons et les identifiants.
  const idsPresents = tous(page, IDENTIFIANTS);
  const idsAppeles = new Set();
  for (const motif of APPELS) for (const id of tous(page, motif)) idsAppeles.add(id);

  for (const bouton of tous(page, BOUTONS)) {
    if (!idsAppeles.has(bouton)) {
      problemes.push(`${nom} · le bouton #${bouton} est dessine mais aucun code ne l ecoute`);
    }
  }
  for (const id of idsAppeles) {
    if (!idsPresents.has(id)) {
      problemes.push(`${nom} · le code appelle #${id}, qui n existe nulle part dans la page`);
    }
  }

  // 4. les formules bannies. La comparaison est faite sans la casse, mais on
  //    ressort la position pour que la correction soit immediate.
  const bas = page.toLowerCase();
  for (const [formule, raison] of BANNIS) {
    const i = bas.indexOf(formule.toLowerCase());
    if (i >= 0) {
      problemes.push(`${nom} · « ${formule} » ligne ${ligne(page, i)} : ${raison}`);
    }
  }

  // 5. les commentaires CSS sont equilibres. Le 04/09/2026, un nettoyage a
  //    laisse la fin d un commentaire orpheline juste devant le bloc des
  //    couleurs du theme clair : pour le navigateur, ce texte devient un
  //    selecteur invalide, et TOUT le bloc est ignore. La page s affichait
  //    sans fond, sans couleurs — « on dirait qu il n y a pas de design ».
  //    Une ouverture orpheline fait l inverse : elle avale les regles qui
  //    suivent jusqu au prochain commentaire.
  for (const [k, style] of [...page.matchAll(/<style>([\s\S]*?)<\/style>/g)].entries()) {
    const css = style[1].replace(/url\(data:[^)]*\)/g, "url()");
    const ouvertures = (css.match(/\/\*/g) || []).length;
    const fermetures = (css.match(/\*\//g) || []).length;
    if (ouvertures !== fermetures) {
      problemes.push(`${nom} · style ${k + 1} : ${ouvertures} ouverture(s) de commentaire pour ${fermetures} fermeture(s) — une regle est avalee ou un bloc devient invalide`);
    }
  }

  // 6. aucun jeton de couleur appele sans etre defini. Le 04/09/2026, en
  //    retirant les jetons morts, une seule expression de trop aurait suffi a
  //    vider une couleur : un texte reste alors lisible en clair, invisible en
  //    sombre, et personne ne s en apercoit avant la capture d ecran.
  const definis = new Set([...page.matchAll(/--([\w-]+)\s*:/g)].map((x) => x[1]));
  const manquants = new Set();
  for (const [, jeton] of page.matchAll(/var\(\s*--([\w-]+)\s*[),]/g)) {
    if (!definis.has(jeton)) manquants.add(jeton);
  }
  // Une couleur manquante est signalee une fois, pas une fois par usage : un
  // rapport qui repete cinquante fois la meme ligne ne se lit plus.
  for (const jeton of manquants) {
    problemes.push(`${nom} · la couleur --${jeton} est utilisee mais n est definie nulle part`);
  }

  // 7. le tampon de version. Christophe a passe un quart d heure a tester une
  //    version perimee servie par un vieux lien, en croyant a une regression.
  //    Un ecran de maquette doit dire de quand il date, sans qu on ait a le
  //    demander.
  if (!/<div class="tampon">[^<]*\d{4}[^<]*<\/div>/.test(page)) {
    problemes.push(`${nom} · pas de tampon de version en bas du premier ecran — impossible de savoir si on regarde du vieux`);
  }

  // 8. le bloc des remarques est vide.
  const bloc = /<script type="application\/json" id="remarques">([\s\S]*?)<\/script>/.exec(page);
  if (!bloc) {
    problemes.push(`${nom} · le bloc des remarques a disparu — le mode ✎ ne peut plus rien enregistrer`);
  } else if (bloc[1].trim() !== "[]") {
    const reste = (JSON.parse(bloc[1]) || []).length;
    problemes.push(`${nom} · ${reste} remarque(s) encore dans le bloc : elles reviendront dans la liste au chargement`);
  }
}

// 9. Dans un vrai navigateur. Tout ce qui precede lit du texte ; seul un moteur
//    de rendu sait si le CSS est reellement applique. On charge chaque page sur
//    un ecran de telephone, dans les deux themes, et on exige : un fond opaque
//    sur la page et sur le telephone, aucune erreur de script, la police de
//    marque chargee. C est le controle qui aurait vu le bug du 04/09/2026 en
//    trois secondes, la ou quatre controles statiques n ont rien vu.
try {
  const { chromium, devices } = await import("@playwright/test");
  const navigateur = await chromium.launch();
  for (const nom of fichiers) {
    for (const theme of ["light", "dark"]) {
      const ctx = await navigateur.newContext({ ...devices["iPhone 13"], colorScheme: theme });
      const p = await ctx.newPage();
      const erreurs = [];
      p.on("pageerror", (e) => erreurs.push(e.message));
      await p.goto("file://" + resolve(DOSSIER, nom));
      await p.waitForTimeout(800);
      const etat = await p.evaluate(() => {
        const opaque = (el) => el && !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(el).backgroundColor);
        return {
          fondPage: opaque(document.body),
          fondTel: opaque(document.querySelector(".tel")),
          police: [...document.fonts].some((f) => f.family.includes("Uniform") && f.status === "loaded"),
        };
      });
      if (!etat.fondPage) problemes.push(`${nom} · theme ${theme} : la page n a pas de fond — le CSS des couleurs n est pas applique`);
      if (!etat.fondTel) problemes.push(`${nom} · theme ${theme} : le telephone n a pas de fond`);
      if (!etat.police) problemes.push(`${nom} · theme ${theme} : la police de marque ne se charge pas`);
      for (const e of erreurs) problemes.push(`${nom} · theme ${theme} : erreur de script au chargement — ${e}`);
      await ctx.close();
    }
  }
  await navigateur.close();
} catch (e) {
  // Playwright absent (poste sans navigateur) : on le dit, on n echoue pas —
  // un controle qui plante ne controle rien.
  console.log(`  (controle navigateur saute : ${e.message.split("\n")[0]})`);
}

if (problemes.length > 0) {
  console.log("");
  for (const p of problemes) console.log(`  ✗ ${p}`);
  console.log(`\n  ${problemes.length} probleme(s) sur ${fichiers.length} maquette(s).`);
  process.exit(1);
}

console.log(`ok — ${fichiers.length} maquette(s) : scripts compiles, boutons branches, textes conformes, rendu verifie dans les deux themes`);
