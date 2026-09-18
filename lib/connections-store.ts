/**
 * Connections Store — dual-write: localStorage (instant) + Supabase (persistent).
 * Each connection = a person with birth data, linked via invite code.
 */

import type { BirthData } from "@/lib/birth-data";
import { isNative } from "@/lib/platform";
import {
  addRemoteConnection,
  updateRemoteRelationship,
  renameRemoteConnection,
  removeRemoteConnection,
  getRemoteConnections,
  persistInviteCode,
  type SupabaseConnection,
} from "@/lib/supabase-store";

export type RelationshipType = "partner" | "friend" | "family" | "colleague";

export interface RealConnection {
  id: string;
  name: string;
  initial: string;
  relationship: RelationshipType;
  birthData: BirthData;
  /**
   * Deux facons d avoir un match : deux applications qui se relient par un
   * code, ou une seule qui encode elle-meme la naissance de l autre — Christophe,
   * le 18/09 : « soit deux apps se connectent, soit une seule app peut encoder
   * elle-meme un match qu elle a envie de faire ».
   *
   * `isSolo: true` marque ce second cas. Ce champ n est pas cosmetique : il
   * commande `connectedSince` et `inviteCode` juste en dessous, et le choix de
   * ne JAMAIS synchroniser ces fiches vers Supabase (voir addSoloConnection) —
   * la personne decrite n a rien consenti.
   */
  isSolo: boolean;
  /** Toujours presente, solo ou connecte : sert au tri par recence. */
  createdAt: string; // ISO date
  /**
   * Absent pour un match solo. Une vraie date de RECIPROCITE n existe que
   * lorsque deux appareils se sont effectivement relies — en inventer une
   * pour une fiche solo ferait croire a une reciprocite qui n a jamais eu
   * lieu.
   */
  connectedSince?: string; // ISO date
  /**
   * Absent pour un match solo, pour la meme raison : aucun code n a ete
   * echange, il n y a personne de l autre cote pour en detenir un.
   */
  inviteCode?: string;
}

const STORAGE_KEY = "unfold_connections";

function readAll(): RealConnection[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(connections: RealConnection[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(connections));
}

export function getConnections(): RealConnection[] {
  return readAll();
}

export function getConnection(id: string): RealConnection | null {
  return readAll().find((c) => c.id === id) ?? null;
}

export function getConnectionByCode(code: string): RealConnection | null {
  return readAll().find((c) => c.inviteCode === code) ?? null;
}

/**
 * Cree une connexion RECIPROQUE : les deux personnes ont chacune leur
 * application, et `inviteCode` est le code que l une a partage et l autre a
 * saisi. Voir addSoloConnection() pour l autre voie, sans code ni reciprocite.
 */
export function addConnection(
  conn: Omit<RealConnection, "id" | "initial" | "connectedSince" | "isSolo" | "createdAt"> & { inviteCode: string },
): RealConnection {
  const all = readAll();

  // Don't add duplicates (same invite code) — jamais une fiche solo, qui n en
  // porte pas : deux `undefined` ne doivent pas se lire comme un doublon.
  const existing = all.find((c) => !c.isSolo && c.inviteCode === conn.inviteCode);
  if (existing) return existing;

  const now = new Date().toISOString();
  const newConn: RealConnection = {
    ...conn,
    id: `conn_${Date.now()}`,
    initial: conn.name.charAt(0).toUpperCase(),
    isSolo: false,
    createdAt: now,
    connectedSince: now,
  };

  all.push(newConn);
  writeAll(all);

  // Dual-write to Supabase (fire-and-forget). `conn.inviteCode`, pas
  // `newConn.inviteCode` : le type de RealConnection le rend optionnel (pour
  // les fiches solo), celui du parametre de cette fonction le garde requis.
  addRemoteConnection({
    name: newConn.name,
    initial: newConn.initial,
    relationship: newConn.relationship,
    birthData: newConn.birthData,
    inviteCode: conn.inviteCode,
  }).catch(() => {});

  return newConn;
}

/**
 * Cree un match SOLO : une fiche que l utilisateur encode lui-meme — nom,
 * naissance, categorie — pour quelqu un qui n installe rien, ne recoit et ne
 * saisit aucun code. C est la seconde des deux voies que Christophe a
 * demandees le 18/09.
 *
 * Reste UNIQUEMENT en local (localStorage), volontairement : il n y a pas de
 * second appareil avec qui synchroniser, et la personne decrite n a donne
 * aucun consentement a ce que sa naissance parte sur Supabase. L ecrire quand
 * meme n apporterait rien — personne d autre ne la relit jamais — et
 * exposerait les donnees d un tiers sans sa permission.
 */
export function addSoloConnection(conn: {
  name: string;
  relationship: RelationshipType;
  birthData: BirthData;
}): RealConnection {
  const all = readAll();
  const now = new Date().toISOString();
  const newConn: RealConnection = {
    ...conn,
    id: `solo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    initial: conn.name.trim().charAt(0).toUpperCase() || "?",
    isSolo: true,
    createdAt: now,
    // Ni connectedSince, ni inviteCode : voir le commentaire sur ces deux
    // champs dans RealConnection.
  };

  all.push(newConn);
  writeAll(all);
  // Pas de dual-write : voir le commentaire de la fonction.
  return newConn;
}

export function updateRelationship(id: string, relationship: RelationshipType): void {
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (conn) {
    conn.relationship = relationship;
    writeAll(all);
    // Dual-write — jamais pour une fiche solo, qui n a pas de code distant a
    // mettre a jour (voir isSolo dans RealConnection).
    if (!conn.isSolo && conn.inviteCode) {
      updateRemoteRelationship(conn.inviteCode, relationship).catch(() => {});
    }
  }
}

export function renameConnection(id: string, name: string): void {
  const trimmed = name.trim();
  if (!trimmed) return;
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (!conn) return;
  conn.name = trimmed;
  conn.initial = trimmed.charAt(0).toUpperCase();
  writeAll(all);
  // Dual-write to Supabase (fire-and-forget) — jamais pour une fiche solo.
  if (!conn.isSolo && conn.inviteCode) {
    renameRemoteConnection(conn.inviteCode, trimmed, conn.initial).catch(() => {});
  }
}

export function removeConnection(id: string): void {
  const all = readAll();
  const conn = all.find((c) => c.id === id);
  if (conn) {
    writeAll(all.filter((c) => c.id !== id));
    // Dual-write — jamais pour une fiche solo, qui n existe pas cote serveur.
    if (!conn.isSolo && conn.inviteCode) {
      removeRemoteConnection(conn.inviteCode).catch(() => {});
    }
  }
}

/**
 * Fabrique le code d invitation de la personne.
 *
 * Format : FAV-XXXX, quatre caracteres tires sans les confusables (ni 0/O,
 * ni 1/I) — un code se lit a voix haute et se recopie a la main.
 *
 * Les codes UNFOLD-XXXX deja emis restent valides pour toujours : la base et la
 * route serveur acceptent les deux formes, et aucun code existant n a ete
 * reecrit. Quelqu un qui a partage le sien par capture d ecran il y a six mois
 * doit encore pouvoir etre rejoint.
 */
export function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `FAV-${code}`;
}

const MY_CODE_KEY = "unfold_my_invite_code";

export function getMyInviteCode(): string {
  if (typeof window === "undefined") return "FAV-XXXX";
  let code = localStorage.getItem(MY_CODE_KEY);
  if (!code) {
    code = generateInviteCode();
    localStorage.setItem(MY_CODE_KEY, code);
  }
  // Persist to Supabase (fire-and-forget)
  persistInviteCode(code).catch(() => {});
  return code;
}

/**
 * Sync local connections with Supabase (background, non-blocking).
 * Merges remote connections that don't exist locally.
 */
export async function syncConnections(): Promise<void> {
  try {
    const local = readAll();
    const remote = await getRemoteConnections();

    let changed = false;
    for (const r of remote) {
      if (!local.some((l) => l.inviteCode === r.invite_code)) {
        local.push(remoteToLocal(r));
        changed = true;
      }
    }
    if (changed) writeAll(local);
  } catch {
    // Sync failed silently
  }
}

function remoteToLocal(r: SupabaseConnection): RealConnection {
  return {
    id: `conn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: r.name,
    initial: r.initial ?? r.name.charAt(0).toUpperCase(),
    relationship: r.relationship as RelationshipType,
    birthData: {
      nickname: r.name,
      birthDate: r.birth_date ?? "",
      birthTime: r.birth_time ?? "",
      latitude: r.latitude ?? 0,
      longitude: r.longitude ?? 0,
      timezone: r.timezone ?? "Europe/Paris",
      placeOfBirth: r.place_of_birth ?? "",
    },
    isSolo: false,
    createdAt: r.connected_since,
    connectedSince: r.connected_since,
    inviteCode: r.invite_code,
  };
}

/**
 * Encode birth data into a shareable invite URL.
 *
 * ─── LE PARTAGE PAR LIEN, REPARE LE 18/09 ───────────────────────────────────
 *
 * Christophe : « les partages avec les URL ne fonctionnent pas bien ». La
 * moitie de la panne — les Universal Links iOS qui ouvrent Safari au lieu de
 * l app — a deja ete reparee aujourd hui (voir app/.well-known/apple-app-site-
 * association/route.ts et ios/App/App/App.entitlements). L autre moitie
 * vivait ICI, dans la fonction qui FABRIQUE le lien.
 *
 * `window.location.origin` vaut `capacitor://localhost` (ou le schema natif
 * configure) dans la vue web de Capacitor — exactement le meme piege que celui
 * deja corrige pour le lien magique de connexion (voir lib/deep-links.ts,
 * ligne 13, et lib/supabase-auth.ts). Un lien d invitation fabrique DEPUIS
 * l app — c est-a-dire pour la quasi-totalite des utilisateurs, puisque
 * l app est le seul endroit d ou l on invite quelqu un — portait donc une
 * adresse `capacitor://...` : WhatsApp, SMS et email l affichaient comme du
 * texte brut, et un lien copie-colle n ouvrait rien nulle part. Le code saisi
 * a la main, qui ne quitte jamais l app, n a jamais connu ce probleme — c est
 * exactement ce que Christophe a distingue.
 *
 * On force donc le vrai domaine des que la coque est native, au lieu de
 * deduire l origine de l endroit d ou le code tourne.
 */
export function buildInviteUrl(name: string, birthData: BirthData, code: string): string {
  const params = new URLSearchParams({
    name,
    code,
    bd: birthData.birthDate,
    bt: birthData.birthTime,
    lat: String(birthData.latitude),
    lng: String(birthData.longitude),
    tz: birthData.timezone,
    place: birthData.placeOfBirth || "",
  });
  const origin =
    isNative() || typeof window === "undefined"
      ? "https://favorable.day"
      : window.location.origin;
  // « /app », pas « /demo ».
  //
  // Le prefixe /demo ne fonctionne que par les redirections de next.config.ts,
  // et celles-ci sont DESACTIVEES pour le build natif — output: "export" les
  // interdit. Sur le web, la redirection rattrapait l adresse ; dans l app iOS,
  // elle n existe pas, et le parcours d invitation s arretait la.
  return `${origin}/app/invite/join?${params.toString()}`;
}

/**
 * Decode invite URL params into connection data.
 */
export function parseInviteParams(params: URLSearchParams): {
  name: string;
  code: string;
  birthData: BirthData;
} | null {
  const name = params.get("name");
  const code = params.get("code");
  const bd = params.get("bd");
  const bt = params.get("bt");
  const lat = params.get("lat");
  const lng = params.get("lng");
  const tz = params.get("tz");

  if (!name || !code || !bd || !bt || !lat || !lng || !tz) return null;

  return {
    name,
    code,
    birthData: {
      nickname: name,
      birthDate: bd,
      birthTime: bt,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      timezone: tz,
      placeOfBirth: params.get("place") || "",
    },
  };
}
