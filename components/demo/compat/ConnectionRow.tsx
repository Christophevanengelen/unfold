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
import { connectionHref } from "@/lib/connection-href";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

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
  const locale = detectLocale();
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
      router.push(connectionHref(connection.id));
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
      aria-label={`${connection.name}, ${perso(rel.cleLabel, locale)}`}
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

      {/* Deux lignes, pas une.
          Avant : le nom sur la premiere ligne, puis « RELATION · resume » sur
          la seconde, dans un flex sans largeur minimale ni troncature. Des que
          le resume depassait — et il depasse dans la plupart des langues — il
          repassait a la ligne SOUS la relation, chevauchait, et poussait le
          chevron. C est ce que Christophe a vu : des textes qui empietent.

          Maintenant la relation tient a droite du nom, ou elle ne bouge plus
          (shrink-0), et le resume occupe seul sa ligne, sur toute la largeur.
          C est l information que cette liste existe pour montrer : elle merite
          sa ligne. `min-w-0` sur les deux niveaux est ce qui autorise la
          troncature a fonctionner dans un flex. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text-heading">
            {connection.name}
          </span>
          {pulse && <TierPulse color={summary!.currentTierColor} size={6} />}
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-text-body-subtle">
            {perso(rel.cleLabel, locale)}
          </span>
        </div>
        <div className="mt-1 min-w-0">
          <WindowMicroPreview summary={summary} loading={loading} />
        </div>
      </div>

      <ChevronRight size={16} className="shrink-0 text-text-body-subtle" />
    </div>
  );
}
