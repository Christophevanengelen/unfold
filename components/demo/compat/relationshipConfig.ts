/**
 * Relationship config — single source of truth for the 4 supported
 * connection types. Used by the list, detail, invite flow, and action sheet.
 *
 * Replaces the emoji-based RELATIONSHIP_OPTIONS hardcodes scattered across:
 *   - app/demo/invite/connected/page.tsx
 *   - app/demo/compatibility/[connectionId]/page.tsx
 *   - app/demo/compatibility/test/page.tsx
 *
 * Flowbite-only (no emoji/emoticon — project rule).
 */

import type { ComponentType, SVGProps } from "react";
import { Heart, Star, Home, Briefcase } from "flowbite-react-icons/solid";
import type { RelationshipType } from "@/lib/connections-store";

export interface RelationshipDescriptor {
  key: RelationshipType;
  labelFR: string;
  color: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const relationshipConfig: Record<RelationshipType, RelationshipDescriptor> = {
  partner: {
    key: "partner",
    labelFR: "Partenaire",
    color: "#D89EA0",
    Icon: Heart,
  },
  friend: {
    key: "friend",
    labelFR: "Ami·e",
    color: "#50C4D6",
    Icon: Star,
  },
  family: {
    key: "family",
    labelFR: "Famille",
    color: "#6BA89A",
    Icon: Home,
  },
  colleague: {
    key: "colleague",
    labelFR: "Collègue",
    color: "#9585CC",
    Icon: Briefcase,
  },
};

/** Ordered list for pickers/chips. Order is the social closeness default: partner → friend → family → colleague. */
export const relationshipOrder: RelationshipType[] = ["partner", "friend", "family", "colleague"];

/** Lookup helper — never returns undefined for the 4 known types. */
export function getRelationship(key: RelationshipType): RelationshipDescriptor {
  return relationshipConfig[key];
}
