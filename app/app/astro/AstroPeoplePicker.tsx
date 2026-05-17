"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { formatEuropeanDateInput } from "@/lib/european-date";
import type { PeopleSource, PersonResult } from "@/app/api/astrolearn/admin/people/route";

type ViewSubject =
  | { source: "astrolearn"; personId: string; label: string; username?: string }
  | { source: "unfold"; deviceId: string; label: string };

type AstroPeoplePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelected: (subject: ViewSubject | null) => void;
};

const TABS: { id: PeopleSource; label: string; placeholder: string }[] = [
  {
    id: "mine",
    label: "My People",
    placeholder: "Search by name or birth date (DD/MM/YYYY)",
  },
  {
    id: "bubble",
    label: "Bubble DB",
    placeholder: "Search by name, email, or birth date (DD/MM/YYYY)",
  },
  {
    id: "astrolearn",
    label: "AstroLearn DB",
    placeholder: "Search by name, email, or birth date (DD/MM/YYYY)",
  },
  {
    id: "unfold",
    label: "Unfold App",
    placeholder: "Search by name, email, device, or birth date (DD/MM/YYYY)",
  },
];

export default function AstroPeoplePicker({ open, onClose, onSelected }: AstroPeoplePickerProps) {
  const router = useRouter();
  const [tab, setTab] = useState<PeopleSource>("mine");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ source: tab, q: query, limit: "50" });
        const res = await fetch(`/api/astrolearn/admin/people?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Search failed");
          setResults([]);
          return;
        }
        setResults(Array.isArray(data.data) ? data.data : []);
      } catch {
        setError("Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [open, tab, query]);

  async function handleSelect(person: PersonResult) {
    const subject: ViewSubject =
      person.source === "astrolearn"
        ? {
            source: "astrolearn",
            personId: person.personId ?? person.id,
            label: person.label,
            ...(person.username ? { username: person.username } : {}),
          }
        : { source: "unfold", deviceId: person.deviceId ?? person.id, label: person.label };

    const res = await fetch("/api/astrolearn/admin/view-subject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subject),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not select person");
      return;
    }

    onSelected(subject);
    onClose();
    router.refresh();
    window.dispatchEvent(new CustomEvent("astrolearn:subject-changed"));
  }

  async function handleClear() {
    await fetch("/api/astrolearn/admin/view-subject", { method: "DELETE" });
    onSelected(null);
    onClose();
    router.refresh();
    window.dispatchEvent(new CustomEvent("astrolearn:subject-changed"));
  }

  if (!open) return null;

  const currentTab = TABS.find((t) => t.id === tab)!;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 px-4 py-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-[#2E2654] bg-[#0F0C22] p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white">Find a person</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#8C7FAE] hover:text-white transition-colors"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => { setTab(id); setQuery(""); }}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors"
              style={{
                background: tab === id ? "rgba(149,133,204,0.2)" : "rgba(255,255,255,0.04)",
                color: tab === id ? "#D8CFF0" : "#8C7FAE",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={currentTab.placeholder}
          className="w-full bg-[#130F27] border border-[#2E2654] rounded-lg px-4 py-3 text-sm text-white placeholder-[#4A4070] focus:outline-none focus:border-[#7C6BBF] transition-colors mb-3"
        />

        {error ? <p className="text-xs text-red-400 mb-3">{error}</p> : null}

        <div className="max-h-[50vh] overflow-y-auto space-y-2">
          {loading ? <p className="text-xs text-[#8C7FAE]">Searching…</p> : null}
          {!loading && results.length === 0 ? (
            <p className="text-xs text-[#8C7FAE]">No people found.</p>
          ) : null}
          {results.map((person) => (
            <button
              key={`${person.source}-${person.id}`}
              type="button"
              onClick={() => handleSelect(person)}
              className="w-full text-left rounded-lg border border-[#2E2654] bg-[#130F27] px-3 py-3 hover:border-[#7C6BBF] transition-colors flex items-center gap-3"
            >
              {person.picture ? (
                <img
                  src={person.picture}
                  alt=""
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#2E2654] flex-shrink-0 flex items-center justify-center text-[10px] text-[#8C7FAE] font-semibold">
                  {person.label.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{person.label}</p>
                <p className="text-[11px] text-[#8C7FAE] mt-0.5 truncate">
                  {person.source === "astrolearn"
                    ? person.username || `ID ${person.personId ?? person.id}`
                    : person.deviceId}
                  {person.birthDate ? ` · ${formatEuropeanDateInput(person.birthDate)}` : ""}
                  {person.city ? ` · ${person.city}` : ""}
                </p>
              </div>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleClear}
          className="mt-4 w-full text-xs text-[#8C7FAE] hover:text-white transition-colors"
        >
          Clear selected person
        </button>
      </div>
    </div>
  );
}
