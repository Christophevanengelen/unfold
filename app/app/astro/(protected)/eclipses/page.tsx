"use client";

import { useEffect, useState } from "react";

interface EclipseEvent {
  date?: string;
  exactDate?: string;
  type?: string;
  aspect?: string;
  transitPlanet?: string;
  planet?: string;
  natalPlanet?: string;
  natal?: string;
  sign?: string;
  house?: number;
  [key: string]: unknown;
}

function EclipseTypeBadge({ type }: { type: string }) {
  const isSolar = type.toLowerCase().includes("solar") || type.toLowerCase().includes("sun");
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={
        isSolar
          ? { background: "rgba(244,196,48,0.12)", color: "#F4C430", border: "1px solid rgba(244,196,48,0.25)" }
          : { background: "rgba(149,133,204,0.12)", color: "#9585CC", border: "1px solid rgba(149,133,204,0.25)" }
      }
    >
      {isSolar ? "Solar" : "Lunar"}
    </span>
  );
}

export default function EclipsesPage() {
  const [events, setEvents] = useState<EclipseEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/astrolearn/eclipses")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setEvents(Array.isArray(d.data) ? d.data : []);
      })
      .catch(() => setError("Failed to load eclipse data"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating eclipse cycles…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-900/40 bg-red-950/20 p-6 text-center mt-8">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Eclipse Cycles</h1>
        <p className="text-sm text-[#8C7FAE] mt-1">
          Eclipses activating your natal chart · next 12 months
        </p>
      </div>

      {events.length === 0 ? (
        <div
          className="rounded-2xl px-6 py-12 text-center"
          style={{ background: "rgba(19,15,39,0.7)", border: "1px solid rgba(46,38,84,0.5)" }}
        >
          <div className="text-4xl mb-3 opacity-30">◐</div>
          <p className="text-[#8C7FAE] text-sm">No eclipse activations found for the next 12 months.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, i) => {
            const date = (ev.exactDate || ev.date || "").slice(0, 10);
            const tPlanet = ev.transitPlanet || ev.planet || "";
            const aspect = ev.aspect || ev.type || "";
            const nPlanet = ev.natalPlanet || ev.natal || "";
            const isPast = date && new Date(date) < new Date();
            return (
              <div
                key={i}
                className="rounded-2xl px-5 py-4"
                style={{
                  background: "rgba(19,15,39,0.75)",
                  border: "1px solid rgba(46,38,84,0.5)",
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      {(tPlanet.toLowerCase().includes("sun") || tPlanet.toLowerCase().includes("moon")) && (
                        <EclipseTypeBadge type={tPlanet} />
                      )}
                      {ev.type && <EclipseTypeBadge type={String(ev.type)} />}
                    </div>
                    <div className="text-sm text-white font-medium">
                      {tPlanet && <span className="text-[#9585CC]">{tPlanet}</span>}
                      {aspect && !ev.type && (
                        <span className="text-[#8C7FAE] mx-1.5 text-xs">{aspect}</span>
                      )}
                      {nPlanet && <span className="text-[#C0B0E0] ml-1">{nPlanet}</span>}
                    </div>
                    {(ev.sign || ev.house) && (
                      <div className="text-xs text-[#8C7FAE] mt-1">
                        {ev.sign}
                        {ev.house ? (
                          <span className="ml-2 text-[#4A4070]">House {ev.house}</span>
                        ) : null}
                      </div>
                    )}
                  </div>
                  <div
                    className="text-xs font-mono flex-shrink-0 text-right"
                    style={{ color: isPast ? "#4A4070" : "#9585CC" }}
                  >
                    {date}
                    {isPast && <div className="text-[10px] text-[#4A4070]">past</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
