import { Pool } from "pg";

let pool: Pool | null = null;
let bubblePool: Pool | null = null;

/**
 * ─── POURQUOI CES REPLIS ONT DISPARU LE 02/09/2026 ─────────────────────────
 *
 * Ces deux fonctions retombaient sur une chaine de connexion contenant le mot
 * de passe Postgres EN CLAIR, dans un depot PUBLIC. Le meme mot de passe etait
 * aussi ecrit dans app/api/celebs/route.ts.
 *
 * **Ce mot de passe doit etre considere comme compromis et change.** L effacer
 * du code ne l efface pas de l historique git : il reste lisible dans tous les
 * commits anterieurs.
 *
 * Un repli qui contient un secret n est pas un filet, c est une fuite. Sans
 * variable d environnement, on refuse — c est le seul comportement honnete.
 */
function readConnectionString(): string {
  const url = process.env.ASTROLEARN_DATABASE_URL?.trim();
  if (!url) throw new Error("ASTROLEARN_DATABASE_URL absente");
  return url;
}

function readBubbleConnectionString(): string {
  const url = process.env.BUBBLE_DATABASE_URL?.trim();
  if (!url) throw new Error("BUBBLE_DATABASE_URL absente");
  return url;
}

export function getAstrolearnPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: readConnectionString() });
  }
  return pool;
}

export function getBubblePool(): Pool {
  if (!bubblePool) {
    bubblePool = new Pool({ connectionString: readBubbleConnectionString() });
  }
  return bubblePool;
}
