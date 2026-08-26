"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import PersonEventSelector from "@/app/app/astro/(protected)/chart/PersonEventSelector";
import { useAstrolearnSessionTime } from "@/lib/astrolearn-session-time";
import { useAstrolearnSubjectReload } from "@/lib/use-astrolearn-subject-reload";
import type { PersonEvent } from "@/lib/person-events";
import { apiFetch } from "@/lib/api-client";

export default function AstrolearnEventContextBar() {
  const pathname = usePathname();
  const reloadKey = useAstrolearnSubjectReload();
  const { selectedEventId, selectEvent, goToLiveNow, isLiveNow } = useAstrolearnSessionTime();
  const [events, setEvents] = useState<PersonEvent[]>([]);

  const isChartRoute =
    pathname === "/app/astro/chart" || pathname.startsWith("/app/astro/chart/");
  const isZrRoute = pathname === "/app/astro/zr" || pathname.startsWith("/app/astro/zr/");

  useEffect(() => {
    let cancelled = false;

    apiFetch("/api/astrolearn/events")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled) {
          setEvents(Array.isArray(payload.data) ? payload.data : []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEvents([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  if (isChartRoute || events.length === 0) {
    return null;
  }

  return (
    <div
      className={`mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between${isZrRoute ? " px-4" : ""}`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7FAE]">
          Reference date
        </p>
        <p className="mt-1 text-xs text-[#C8B8F0]">
          {isLiveNow
            ? "Using live transits across tabs."
            : "Using the selected life event as today across tabs."}
        </p>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
        <PersonEventSelector
          events={events}
          selectedEventId={selectedEventId}
          onSelect={selectEvent}
        />
        {!isLiveNow ? (
          <button
            type="button"
            onClick={goToLiveNow}
            className="rounded-2xl border border-[#2E2654] px-4 py-2.5 text-xs font-bold text-[#C8B8F0] transition-colors hover:bg-[#9585CC]/12"
          >
            Now
          </button>
        ) : null}
      </div>
    </div>
  );
}
