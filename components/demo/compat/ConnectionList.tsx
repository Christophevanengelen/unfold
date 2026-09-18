"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { fetchConnectionBrief } from "@/lib/connection-brief-api";
import { extractSummary, type ConnectionSummary } from "@/lib/connection-summary";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { ConnectionRow } from "./ConnectionRow";
import { ConnectionListSection } from "./ConnectionListSection";
import { ConnectionActionSheet } from "./ConnectionActionSheet";
import { ConnectionFilterBar, type FiltreCategorie } from "./ConnectionFilterBar";
import { VitrineBase } from "./VitrineBase";
import { detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

interface ConnectionListProps {
  connections: RealConnection[];
  myBirthData: BirthData | null;
  onDeleted?: (id: string) => void;
  /**
   * Ouvre le formulaire de saisie de code, tenu par la page.
   *
   * BUG DU 17/09 AU SOIR : le bouton « J'ai recu un code » de la vitrine
   * pointait vers `/app/invite/join`, une page qui n attend QUE des
   * parametres d URL (`?name=X&code=X&...`) et qui redirige silencieusement
   * vers cette meme page des qu ils manquent. Sans lien profond, cliquer
   * dessus ne faisait donc RIEN de visible — exactement ce que Christophe a
   * signale : « je ne peux pas encoder le code ».
   *
   * Le vrai formulaire de saisie existe deja plus bas sur cette page — champ,
   * validation, message d erreur — mais il n apparaissait qu APRES avoir deja
   * une connexion. Premier utilisateur, cercle vicieux garanti.
   */
  onCodeRecu?: () => void;
}

/**
 * The "rhythm inbox" — groups connections by signal status and renders
 * each with its own live summary (fetched in parallel via SWR).
 *
 * Empty state & share CTAs are rendered by the parent page — this component
 * only owns the list itself.
 */
export function ConnectionList({ connections, myBirthData, onDeleted, onCodeRecu }: ConnectionListProps) {
  const locale = detectLocale();
  // La feuille garde la connexion ET la vue de depart : un balayage vers la
  // gauche puis "Supprimer" ouvre directement l ecran de confirmation — un
  // geste deja explicite n a pas besoin d un detour par le menu general.
  const [sheet, setSheet] = useState<{ conn: RealConnection; vue: "menu" | "confirmDelete" } | null>(null);

  // Filtre par categorie de relation — la demande de Christophe : « les trier
  // par amour, travail, famille, etc. ». Les compteurs viennent de la liste
  // COMPLETE, pas du filtre courant, pour que "Famille (2)" reste visible
  // pendant qu on regarde "Amis".
  const [filtre, setFiltre] = useState<FiltreCategorie>("tous");
  const comptes = useMemo(() => {
    const c: Record<FiltreCategorie, number> = { tous: connections.length, partner: 0, friend: 0, family: 0, colleague: 0 };
    for (const conn of connections) c[conn.relationship]++;
    return c;
  }, [connections]);
  const connectionsFiltrees = useMemo(
    () => (filtre === "tous" ? connections : connections.filter((c) => c.relationship === filtre)),
    [connections, filtre],
  );

  // Group summaries by status once they're loaded. Le calcul part de la liste
  // COMPLETE : changer de filtre ne doit pas relancer les requetes SWR de
  // connexions deja chargees, seulement changer ce qu on en montre.
  const summaries = useConnectionSummaries(connections, myBirthData, locale);

  const groups = useMemo(() => {
    const buckets: Record<"active" | "upcoming" | "calm" | "unknown", Array<{ conn: RealConnection; summary: ConnectionSummary | undefined; loading: boolean }>> = {
      active: [],
      upcoming: [],
      calm: [],
      unknown: [],
    };
    for (const conn of connectionsFiltrees) {
      const s = summaries[conn.id];
      if (!s || s.loading) {
        buckets.unknown.push({ conn, summary: undefined, loading: true });
        continue;
      }
      buckets[s.summary.status].push({ conn, summary: s.summary, loading: false });
    }
    // Sort each bucket by sortScore desc
    for (const k of ["active", "upcoming", "calm"] as const) {
      buckets[k].sort((a, b) => (b.summary?.sortScore ?? 0) - (a.summary?.sortScore ?? 0));
    }
    return buckets;
  }, [connectionsFiltrees, summaries]);

  const rienDansCetteCategorie =
    connections.length > 0 && filtre !== "tous" && connectionsFiltrees.length === 0;

  return (
    <>
      {/* Puces de filtre — masquees tant qu il n y a rien a filtrer. */}
      {connections.length > 0 && (
        <div className="mt-4">
          <ConnectionFilterBar valeur={filtre} onChange={setFiltre} comptes={comptes} />
        </div>
      )}

      {rienDansCetteCategorie && (
        <p className="mt-8 text-center text-[13px] text-text-body-subtle">
          {perso("compat.categorie_vide", locale)}
        </p>
      )}

      {/* Still-loading rows first — prevents layout jump as summaries resolve */}
      {groups.unknown.length > 0 && (
        <div className="mt-4 space-y-2">
          {groups.unknown.map(({ conn }) => (
            <ConnectionRow
              key={conn.id}
              connection={conn}
              summary={undefined}
              loading
              onLongPress={() => setSheet({ conn, vue: "menu" })}
              onSupprimer={() => setSheet({ conn, vue: "confirmDelete" })}
            />
          ))}
        </div>
      )}

      <ConnectionListSection title={perso("compat.actif", locale)} count={groups.active.length}>
        {groups.active.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheet({ conn, vue: "menu" })}
            onSupprimer={() => setSheet({ conn, vue: "confirmDelete" })}
          />
        ))}
      </ConnectionListSection>

      <ConnectionListSection title={perso("compat.bientot", locale)} count={groups.upcoming.length}>
        {groups.upcoming.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheet({ conn, vue: "menu" })}
            onSupprimer={() => setSheet({ conn, vue: "confirmDelete" })}
          />
        ))}
      </ConnectionListSection>

      <ConnectionListSection title={perso("compat.calme", locale)} count={groups.calm.length} subtle>
        {groups.calm.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheet({ conn, vue: "menu" })}
            onSupprimer={() => setSheet({ conn, vue: "confirmDelete" })}
          />
        ))}
      </ConnectionListSection>

      <ConnectionActionSheet
        // Une cle par connexion : la feuille se remonte quand on en ouvre une
        // autre, donc son etat interne — vue courante, nom en cours de saisie,
        // appui en cours — repart de zero au lieu d etre reinitialise par un
        // effet. C est ce qui permet de retirer la remise a zero qui se
        // declenchait a chaque rafraichissement SWR et effacait la saisie.
        key={sheet?.conn.id ?? "aucune"}
        open={sheet !== null}
        onClose={() => setSheet(null)}
        connection={sheet?.conn ?? null}
        initialView={sheet?.vue}
        onDeleted={(id) => {
          onDeleted?.(id);
        }}
      />

      {/* API-error hint — shows when at least one brief failed */}
      {Object.values(summaries).some((s) => s.error) && (
        <p className="mt-4 text-center text-[10px] text-text-body-subtle">
          {perso("compat.partiel", locale)}
        </p>
      )}

      {/* Personne n est encore connecte : on montre ce que ca donne, sur des
          vies documentees. Ce cadre disait, en francais pour tout le monde,
          « Partagez votre code ou entrez celui d un proche » — c est-a-dire
          exactement ce que disent les deux boutons places juste dessous. Il
          occupait la moitie de l ecran pour repeter la page. */}
      {connections.length === 0 && <VitrineBase locale={locale} naissance={myBirthData} onCodeRecu={onCodeRecu} />}
    </>
  );
}

// ─── Summaries loader (one SWR, parallel fetches) ──────────

interface SummaryState {
  summary: ConnectionSummary;
  loading: boolean;
  error: boolean;
}

function useConnectionSummaries(
  connections: RealConnection[],
  myBirthData: BirthData | null,
  locale: Locale,
): Record<string, SummaryState> {
  // Single SWR subscription keyed by the list shape. The fetcher runs
  // fetchConnectionBrief for every connection in parallel — each call hits
  // its own IndexedDB L1 cache + Supabase L2 cache, so warm loads are fast.
  const canFetch = Boolean(myBirthData?.birthDate) && connections.length > 0;
  const key = canFetch
    ? [
        "compat-summaries",
        myBirthData!.birthDate,
        myBirthData!.birthTime,
        ...connections.map((c) => `${c.id}:${c.birthData.birthDate}:${c.relationship}`),
      ]
    : null;

  const { data, error, isLoading } = useSWR(
    key,
    async () => {
      const results = await Promise.allSettled(
        connections.map((c) =>
          fetchConnectionBrief(myBirthData!, c.birthData, c.relationship, c.name, 3),
        ),
      );
      return connections.reduce<Record<string, { data?: Awaited<ReturnType<typeof fetchConnectionBrief>>; error?: boolean }>>(
        (acc, conn, i) => {
          const r = results[i];
          acc[conn.id] = r.status === "fulfilled" ? { data: r.value } : { error: true };
          return acc;
        },
        {},
      );
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      dedupingInterval: 10 * 60 * 1000, // 10 min
    },
  );

  const out: Record<string, SummaryState> = {};
  for (const conn of connections) {
    const r = data?.[conn.id];
    out[conn.id] = {
      summary: extractSummary(r?.data ?? null, new Date(), locale),
      loading: canFetch && (isLoading || (!data && !error)),
      error: Boolean(r?.error),
    };
  }
  return out;
}
