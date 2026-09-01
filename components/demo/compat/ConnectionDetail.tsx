"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { PageHeader } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { getConnections, type RealConnection } from "@/lib/connections-store";
import { ConnectionStrip } from "@/components/demo/compat/ConnectionStrip";
import { ConnectionCarousel } from "@/components/demo/compat/ConnectionCarousel";
import { ConnectionReport } from "@/components/demo/compat/ConnectionReport";
import { relationshipConfig } from "@/components/demo/compat/relationshipConfig";
import { connectionHref } from "@/lib/connection-href";
import { useTheme } from "next-themes";
import { texteSurAplat } from "@/lib/contraste";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

export function ConnectionDetail({ connectionId }: { connectionId: string }) {
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const [connections, setConnections] = useState<RealConnection[]>([]);
  useEffect(() => {
    setConnections(getConnections());
  }, []);

  const { birthData: myBirthData } = useMomentum();

  const currentIndex = useMemo(
    () => connections.findIndex((c) => c.id === connectionId),
    [connections, connectionId],
  );

  const current = currentIndex >= 0 ? connections[currentIndex] : null;

  // Keep URL in sync when user swipes/taps to another connection
  const handleIndexChange = (newIndex: number) => {
    const next = connections[newIndex];
    if (next && next.id !== connectionId) {
      router.replace(connectionHref(next.id), { scroll: false });
    }
  };

  const handleSelect = (id: string) => {
    const idx = connections.findIndex((c) => c.id === id);
    if (idx >= 0) handleIndexChange(idx);
  };

  if (connections.length === 0 || !current) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">{perso("compat.introuvable", locale)}</p>
      </div>
    );
  }

  const rel = relationshipConfig[current.relationship];

  return (
    <div className="flex min-h-0 flex-col">
      <PageHeader
        backHref="/app/compatibility"
        title={`Vous & ${current.name}`}
        subtitle={perso(rel.cleLabel, locale)}
        leadingSlot={
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
            // rel.color varie a l execution : on choisit le noir ou le blanc
            // selon ce qui contraste, au lieu de supposer le blanc.
            style={{
              backgroundColor: rel.color,
              color: texteSurAplat(rel.color, resolvedTheme === "light" ? "clair" : "sombre", 1),
            }}
          >
            {current.initial}
          </div>
        }
      />

      <ConnectionStrip
        connections={connections}
        currentId={current.id}
        onSelect={handleSelect}
      />

      {connections.length > 1 ? (
        <ConnectionCarousel
          connections={connections}
          currentIndex={currentIndex}
          myBirthData={myBirthData}
          onIndexChange={handleIndexChange}
        />
      ) : (
        <ConnectionReport connection={current} myBirthData={myBirthData} embedded />
      )}
    </div>
  );
}
