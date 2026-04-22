"use client";

import { UserAdd } from "flowbite-react-icons/outline";
import Link from "next/link";
import type { RealConnection } from "@/lib/connections-store";
import { relationshipConfig } from "./relationshipConfig";
import { RelationshipAvatar } from "./RelationshipAvatar";

interface ConnectionStripProps {
  connections: RealConnection[];
  currentId: string;
  onSelect: (id: string) => void;
}

/**
 * Sticky horizontal avatar strip — the "people browser" above the report.
 * Matches iOS Photos People browser: current person has a highlighted ring,
 * tapping any avatar swaps the detail view.
 *
 * Hidden when only 1 connection (no point showing a strip of one).
 * Last slot is always "Invite someone" — turns dead-end list into growth.
 */
export function ConnectionStrip({ connections, currentId, onSelect }: ConnectionStripProps) {
  if (connections.length <= 1) return null;
  return (
    <div
      className="sticky z-20 -mx-5 px-5 pb-3 pt-2"
      style={{
        top: 0,
        background: "linear-gradient(var(--bg-primary) 80%, transparent)",
      }}
    >
      <div
        className="flex items-center gap-3 overflow-x-auto scrollbar-none"
        style={{ scrollSnapType: "x proximity" }}
      >
        {connections.map((c) => {
          const isCurrent = c.id === currentId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              aria-label={c.name}
              aria-current={isCurrent ? "true" : undefined}
              className="flex shrink-0 flex-col items-center gap-1 transition-transform active:scale-95"
              style={{ scrollSnapAlign: "center" }}
            >
              <RelationshipAvatar
                initial={c.initial}
                relationship={c.relationship}
                ringColor={isCurrent ? relationshipConfig[c.relationship].color : "transparent"}
                size={isCurrent ? 44 : 36}
              />
              <span
                className="truncate text-[9px] font-medium"
                style={{
                  color: isCurrent ? "var(--text-heading)" : "var(--text-body-subtle)",
                  maxWidth: 52,
                }}
              >
                {c.name.split(" ")[0]}
              </span>
            </button>
          );
        })}

        {/* Invite someone slot */}
        <Link
          href="/demo/invite/share"
          className="flex shrink-0 flex-col items-center gap-1"
          style={{ scrollSnapAlign: "center" }}
        >
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-dashed"
            style={{
              borderColor: "var(--border-tint-medium)",
              color: "var(--accent-purple)",
            }}
          >
            <UserAdd width={14} height={14} />
          </span>
          <span
            className="text-[9px] font-medium"
            style={{ color: "var(--text-body-subtle)" }}
          >
            Inviter
          </span>
        </Link>
      </div>
    </div>
  );
}
