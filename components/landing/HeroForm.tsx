"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { searchCities, type GeoResult } from "@/lib/geocode";

export interface HeroFormPayload {
  birthDate: string;
  birthTime: string;
  city: GeoResult;
}

interface HeroFormProps {
  onSubmit: (payload: HeroFormPayload) => void;
  ctaLabel: string;
  privacyNotice: string;
  isSubmitting?: boolean;
}

/**
 * Hero birth-data form — date + time + place autocomplete.
 * Replaces the date-only mock input. Triggers the real signal pipeline
 * via `/api/landing/signal`.
 */
export function HeroForm({ onSubmit, ctaLabel, privacyNotice, isSubmitting }: HeroFormProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityQuery, setCityQuery] = useState("");
  const [city, setCity] = useState<GeoResult | null>(null);
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchingCity, setSearchingCity] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const cityWrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid = Boolean(date && time && city);

  const handleCityChange = (value: string) => {
    setCityQuery(value);
    setCity(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchingCity(false);
      return;
    }
    setSearchingCity(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(value);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSearchingCity(false);
      setHighlightedIdx(-1);
    }, 300);
  };

  const selectCity = useCallback((c: GeoResult) => {
    setCity(c);
    setCityQuery(c.displayName);
    setSuggestions([]);
    setShowSuggestions(false);
    setHighlightedIdx(-1);
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityWrapRef.current && !cityWrapRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      selectCity(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting || !city) return;
    onSubmit({ birthDate: date, birthTime: time, city });
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="mx-auto mt-10 w-full max-w-md"
    >
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
        {/* Row 1 — Date + time */}
        <div className="grid grid-cols-5 gap-2">
          <input
            type="date"
            aria-label="Date de naissance"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            min="1900-01-01"
            disabled={isSubmitting}
            className="col-span-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-logo-lavender/40 focus:ring-1 focus:ring-logo-lavender/20"
          />
          <input
            type="time"
            aria-label="Heure de naissance"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            disabled={isSubmitting}
            className="col-span-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-colors focus:border-logo-lavender/40 focus:ring-1 focus:ring-logo-lavender/20"
          />
        </div>

        {/* Row 2 — Place autocomplete */}
        <div ref={cityWrapRef} className="relative">
          <input
            type="text"
            aria-label="Lieu de naissance"
            value={cityQuery}
            onChange={(e) => handleCityChange(e.target.value)}
            onKeyDown={handleCityKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Lieu de naissance (ville, pays)"
            required
            autoComplete="off"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-white/30 focus:border-logo-lavender/40 focus:ring-1 focus:ring-logo-lavender/20"
          />
          {searchingCity && (
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/40"
              aria-hidden
            >
              recherche…
            </span>
          )}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute left-0 right-0 z-30 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1530] py-1 shadow-2xl"
                role="listbox"
              >
                {suggestions.map((s, i) => (
                  <li key={s.id} role="option" aria-selected={i === highlightedIdx}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectCity(s)}
                      onMouseEnter={() => setHighlightedIdx(i)}
                      className="block w-full px-3 py-2 text-left text-sm text-white/90 transition-colors hover:bg-white/5"
                      style={i === highlightedIdx ? { background: "rgba(255,255,255,0.06)" } : undefined}
                    >
                      <span className="font-medium">{s.name}</span>
                      <span className="ml-2 text-[11px] text-white/40">
                        {[s.admin1, s.country].filter(Boolean).join(", ")}
                      </span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background: "var(--accent-purple)",
            boxShadow: isValid && !isSubmitting
              ? "0 0 24px color-mix(in srgb, var(--accent-purple) 35%, transparent)"
              : "none",
          }}
        >
          {isSubmitting ? "…" : ctaLabel}
        </button>
      </div>

      {/* Privacy notice */}
      <p className="mt-3 px-1 text-center text-[10px] leading-relaxed text-white/35">
        {privacyNotice}
      </p>
    </motion.form>
  );
}
