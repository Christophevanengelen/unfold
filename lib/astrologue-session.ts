/**
 * Persistance des conversations "Parle avec un astrologue" (supabase/016_astrologue.sql).
 *
 * Comme les autres routes openai/*, cote serveur on ne passe pas par
 * lib/birth-data.ts (module client, IndexedDB) : le hash de naissance est
 * recalcule localement, meme format que makeBirthHash dans personalize/route.ts.
 */

import crypto from "crypto";
import { getAdminClient } from "@/lib/db";
import type { BirthDataPayload, ConnexionConnue } from "@/lib/astrologue-routeur";

export function birthHash(bd: { birthDate: string; birthTime: string; latitude: number; longitude: number }): string {
  return `${bd.birthDate}_${bd.birthTime}_${bd.latitude.toFixed(2)}_${bd.longitude.toFixed(2)}`;
}

export interface AstrologueSession {
  id: string;
  device_id: string;
  locale: string | null;
  subject_kind: "self" | "other";
  subject_connection_id: string | null;
  birth_hash: string;
  status: "active" | "archived";
  turn_count: number;
}

export interface AstrologueMessageRow {
  id: string;
  session_id: string;
  turn: number;
  role: "user" | "assistant";
  content: string;
  structured: unknown;
  created_at: string;
}

export async function creerSession(params: {
  deviceId: string;
  birthData: BirthDataPayload;
  locale?: string | null;
  subjectKind: "self" | "other";
  subjectConnectionId?: string | null;
}): Promise<AstrologueSession> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("astrologue_sessions")
    .insert({
      device_id: params.deviceId,
      locale: params.locale ?? "en",
      subject_kind: params.subjectKind,
      subject_connection_id: params.subjectConnectionId ?? null,
      birth_hash: birthHash(params.birthData),
    })
    .select()
    .single();
  if (error || !data) throw new Error(`creerSession: ${error?.message ?? "insert failed"}`);
  return data as AstrologueSession;
}

export async function chargerSession(sessionId: string): Promise<AstrologueSession | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("astrologue_sessions")
    .select()
    .eq("id", sessionId)
    .maybeSingle();
  if (error) throw new Error(`chargerSession: ${error.message}`);
  return (data as AstrologueSession) ?? null;
}

export async function archiverSession(sessionId: string): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("astrologue_sessions")
    .update({ status: "archived" })
    .eq("id", sessionId);
  if (error) throw new Error(`archiverSession: ${error.message}`);
}

export async function chargerMessages(sessionId: string, limite = 20): Promise<AstrologueMessageRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("astrologue_messages")
    .select()
    .eq("session_id", sessionId)
    .order("turn", { ascending: true })
    .limit(limite);
  if (error) throw new Error(`chargerMessages: ${error.message}`);
  return (data as AstrologueMessageRow[]) ?? [];
}

export async function ajouterMessage(params: {
  sessionId: string;
  turn: number;
  role: "user" | "assistant";
  content: string;
  structured?: unknown;
}): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("astrologue_messages").insert({
    session_id: params.sessionId,
    turn: params.turn,
    role: params.role,
    content: params.content,
    structured: params.structured ?? null,
  });
  if (error) throw new Error(`ajouterMessage: ${error.message}`);
}

export async function incrementerTour(sessionId: string, tour: number): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("astrologue_sessions")
    .update({ turn_count: tour })
    .eq("id", sessionId);
  if (error) throw new Error(`incrementerTour: ${error.message}`);
}

// ─── Connexions du device (pour resoudre "autre") ────────────────────────

export async function chargerConnexions(deviceId: string): Promise<ConnexionConnue[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("connections")
    .select("id, name, relationship, birth_date, birth_time, latitude, longitude, timezone")
    .eq("owner_device_id", deviceId);
  if (error) throw new Error(`chargerConnexions: ${error.message}`);
  return ((data ?? []) as Array<Record<string, unknown>>)
    .filter((c) => c.birth_date && c.birth_time && c.latitude != null && c.longitude != null && c.timezone)
    .map((c) => ({
      id: c.id as string,
      name: c.name as string,
      relationship: c.relationship as ConnexionConnue["relationship"],
      birthDate: c.birth_date as string,
      birthTime: c.birth_time as string,
      latitude: c.latitude as number,
      longitude: c.longitude as number,
      timezone: c.timezone as string,
    }));
}

// ─── Handoff des appels moteur lents ──────────────────────────────────────

export function hashParams(params: Record<string, unknown>): string {
  return crypto.createHash("sha256").update(JSON.stringify(params)).digest("hex").slice(0, 32);
}

export interface AstrologueEngineJob {
  id: string;
  session_id: string;
  endpoint: "toctoc-boudin-detail" | "toctoc-app-short";
  params_hash: string;
  params: Record<string, unknown>;
  status: "pending" | "ready" | "failed";
  result: unknown;
  error: string | null;
  consumed_at: string | null;
}

/**
 * Cree le job s il n existe pas deja (meme session+endpoint+params) —
 * idempotent. Renvoie `true` seulement si une NOUVELLE ligne a ete creee :
 * l appelant doit lancer l appel moteur lent uniquement dans ce cas, sinon un
 * tour qui arrive pendant qu un job precedent tourne encore relancerait le
 * meme appel de 50-67s en double sans que la base ne le reflete.
 */
export async function planifierJob(params: {
  sessionId: string;
  turn: number;
  endpoint: AstrologueEngineJob["endpoint"];
  params: Record<string, unknown>;
}): Promise<boolean> {
  const supabase = getAdminClient();
  const paramsHash = hashParams(params.params);
  const { data, error } = await supabase
    .from("astrologue_engine_jobs")
    .upsert(
      {
        session_id: params.sessionId,
        requested_turn: params.turn,
        endpoint: params.endpoint,
        params_hash: paramsHash,
        params: params.params,
        status: "pending",
      },
      { onConflict: "session_id,endpoint,params_hash", ignoreDuplicates: true },
    )
    .select("id");
  if (error) {
    console.error("[astrologue-session] planifierJob:", error.message);
    return false;
  }
  // `ignoreDuplicates` fait que Postgrest ne rend aucune ligne quand la
  // contrainte existait deja (ON CONFLICT DO NOTHING) : un tableau vide veut
  // dire "job deja planifie", pas "insertion vide".
  return (data?.length ?? 0) > 0;
}

export async function marquerJob(
  sessionId: string,
  endpoint: AstrologueEngineJob["endpoint"],
  paramsHash: string,
  resultat: { status: "ready"; result: unknown } | { status: "failed"; error: string },
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("astrologue_engine_jobs")
    .update(resultat)
    .eq("session_id", sessionId)
    .eq("endpoint", endpoint)
    .eq("params_hash", paramsHash);
  if (error) console.error("[astrologue-session] marquerJob:", error.message);
}

/** Tous les jobs prets et pas encore consommes pour cette session — en general 0 ou 1. */
export async function chargerJobsPrets(sessionId: string): Promise<AstrologueEngineJob[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("astrologue_engine_jobs")
    .select()
    .eq("session_id", sessionId)
    .in("status", ["ready", "failed"])
    .is("consumed_at", null)
    .order("updated_at", { ascending: false });
  if (error) {
    console.error("[astrologue-session] chargerJobsPrets:", error.message);
    return [];
  }
  return (data as AstrologueEngineJob[]) ?? [];
}

export async function consommerJob(jobId: string): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("astrologue_engine_jobs")
    .update({ consumed_at: new Date().toISOString() })
    .eq("id", jobId);
  if (error) console.error("[astrologue-session] consommerJob:", error.message);
}
