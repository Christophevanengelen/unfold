"use client";

import { useMemo, useState } from "react";
import { ShareNodes } from "flowbite-react-icons/outline";
import useSWR from "swr";
import { fetchConnectionBrief } from "@/lib/connection-brief-api";
import { extractSummary, type ConnectionSummary } from "@/lib/connection-summary";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { ConnectionRow } from "./ConnectionRow";
import { ConnectionListSection } from "./ConnectionListSection";
import { ConnectionActionSheet } from "./ConnectionActionSheet";

interface ConnectionListProps {
  connections: RealConnection[];
  myBirthData: BirthData | null;
  onDeleted?: (id: string) => void;
}

/**
 * The "rhythm inbox" — groups connections by signal status and renders
 * each with its own live summary (fetched in parallel via SWR).
 *
 * Empty state & share CTAs are rendered by the parent page — this component
 * only owns the list itself.
 */
export function ConnectionList({ connections, myBirthData, onDeleted }: ConnectionListProps) {
  const [sheetConn, setSheetConn] = useState<RealConnection | null>(null);

  // Group summaries by status once they're loaded.
  const summaries = useConnectionSummaries(connections, myBirthData);

  const groups = useMemo(() => {
    const buckets: Record<"active" | "upcoming" | "calm" | "unknown", Array<{ conn: RealConnection; summary: ConnectionSummary | undefined; loading: boolean }>> = {
      active: [],
      upcoming: [],
      calm: [],
      unknown: [],
    };
    for (const conn of connections) {
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
  }, [connections, summaries]);

  return (
    <>
      {/* Still-loading rows first — prevents layout jump as summaries resolve */}
      {groups.unknown.length > 0 && (
        <div className="mt-4 space-y-2">
          {groups.unknown.map(({ conn }) => (
            <ConnectionRow
              key={conn.id}
              connection={conn}
              summary={undefined}
              loading
              onLongPress={() => setSheetConn(conn)}
            />
          ))}
        </div>
      )}

      <ConnectionListSection title="Actif maintenant" count={groups.active.length}>
        {groups.active.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheetConn(conn)}
          />
        ))}
      </ConnectionListSection>

      <ConnectionListSection title="Bientôt" count={groups.upcoming.length}>
        {groups.upcoming.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheetConn(conn)}
          />
        ))}
      </ConnectionListSection>

      <ConnectionListSection title="Calme" count={groups.calm.length} subtle>
        {groups.calm.map(({ conn, summary }) => (
          <ConnectionRow
            key={conn.id}
            connection={conn}
            summary={summary}
            onLongPress={() => setSheetConn(conn)}
          />
        ))}
      </ConnectionListSection>

      <ConnectionActionSheet
        open={sheetConn !== null}
        onClose={() => setSheetConn(null)}
        connection={sheetConn}
        onDeleted={(id) => {
          onDeleted?.(id);
        }}
      />

      {/* API-error hint — shows when at least one brief failed */}
      {Object.values(summaries).some((s) => s.error) && (
        <p className="mt-4 text-center text-[10px] text-text-body-subtle">
          Signal partiel — certaines données sont en cache
        </p>
      )}

      {/* Empty state if somehow connections all return nothing */}
      {connections.length === 0 && (
        <div
          className="mt-6 flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center"
          style={{ background: "var(--surface-subtle)" }}
        >
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center"
            style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }}
          >
            <ShareNodes size={20} style={{ color: "var(--accent-purple)" }} />
          </div>
          <p className="text-sm text-text-body">
            Partagez votre code ou entrez celui d&apos;un proche pour comparer vos rythmes.
          </p>
        </div>
      )}
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
      summary: extractSummary(r?.data ?? null),
      loading: canFetch && (isLoading || (!data && !error)),
      error: Boolean(r?.error),
    };
  }
  return out;
}
