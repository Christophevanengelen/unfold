"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "flowbite-react-icons/outline";
import { useLongPress } from "@/lib/use-long-press";
import type { RealConnection } from "@/lib/connections-store";
import type { ConnectionSummary } from "@/lib/connection-summary";
import { relationshipConfig } from "./relationshipConfig";
import { RelationshipAvatar } from "./RelationshipAvatar";
import { TierPulse } from "./TierPulse";
import { WindowMicroPreview } from "./WindowMicroPreview";

interface ConnectionRowProps {
  connection: RealConnection;
  summary: ConnectionSummary | undefined;
  loading?: boolean;
  onLongPress: () => void;
}

/**
 * 70px-tall list row — the "rhythm inbox" card.
 *
 * Layout:
 *   [avatar with tier ring]  [name + headline]          [pulse (if PEAK active)] [chevron]
 *
 * Ordering + sectioning is handled by ConnectionList, not here.
 */
export function ConnectionRow({ connection, summary, loading, onLongPress }: ConnectionRowProps) {
  const router = useRouter();
  const rel = relationshipConfig[connection.relationship];
  const lp = useLongPress(onLongPress);
  const didLongPressRef = useRef(false);

  // Extract the click-suppression flag out of the spread props
  const { didLongPress, ...dom } = lp;

  const handleClick = (e: React.MouseEvent) => {
    if (didLongPress()) {
      e.preventDefault();
      didLongPressRef.current = true;
      return;
    }
    if (!didLongPressRef.current) {
      router.push(`/demo/compatibility/${connection.id}`);
    }
  };

  const ringColor = summary?.currentTierColor ?? "transparent";
  const pulse = summary?.status === "active" && summary?.currentTier === "PEAK";

  return (
    <div
      {...dom}
      onClick={handleClick}
      role="link"
      tabIndex={0}
      aria-label={`${connection.name}, ${rel.labelFR}`}
      className="group relative flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 transition-all select-none active:scale-[0.995]"
      style={{
        background: "var(--bg-secondary)",
        minHeight: 70,
      }}
    >
      <RelationshipAvatar
        initial={connection.initial}
        relationship={connection.relationship}
        ringColor={ringColor}
        pulse={pulse}
        size={44}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-semibold text-text-heading">
            {connection.name}
          </span>
          {pulse && <TierPulse color={summary!.currentTierColor} size={6} />}
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-text-body-subtle">
            {rel.labelFR}
          </span>
          <span
            className="inline-block h-0.5 w-0.5 rounded-full"
            style={{ background: "var(--text-body-subtle)", opacity: 0.6 }}
          />
          <WindowMicroPreview summary={summary} loading={loading} />
        </div>
      </div>

      <ChevronRight size={16} className="shrink-0 text-text-body-subtle" />
    </div>
  );
}
