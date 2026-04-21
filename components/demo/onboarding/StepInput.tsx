"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { searchCities, type GeoResult } from "@/lib/geocode";

export interface OnboardingFormData {
  nickname: string;
  dob: string;
  timeOfBirth: string;
  placeOfBirth: string;
  /** Resolved coordinates from geocoding — stored when user picks a city */
  resolvedCoords?: { lat: number; lng: number; timezone: string };
}

interface StepInputProps {
  formData: OnboardingFormData;
  onChange: (data: OnboardingFormData) => void;
  onNext: () => void;
  onBack: () => void;
}

const fields = [
  {
    key: "nickname" as const,
    label: "Nickname",
    type: "text",
    placeholder: "How should we call you?",
  },
  {
    key: "dob" as const,
    label: "Date of birth",
    type: "date",
    placeholder: "",
  },
  {
    key: "timeOfBirth" as const,
    label: "Time of birth",
    type: "time",
    placeholder: "HH:MM",
    helper: "Precision sharpens your signal.",
  },
  {
    key: "placeOfBirth" as const,
    label: "Place of birth",
    type: "text",
    placeholder: "City, Country",
  },
];

/**
 * Screen 6 — Configure Your Signal.
 * Place of birth uses live Nominatim geocoding via Open-Meteo.
 */
export function StepInput({
  formData,
  onChange,
  onNext,
  onBack,
}: StepInputProps) {
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const placeRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isValid =
    formData.nickname.trim() !== "" &&
    formData.dob !== "" &&
    formData.timeOfBirth !== "" &&
    formData.placeOfBirth.trim() !== "";

  const handleChange = (key: keyof OnboardingFormData, value: string) => {
    if (key === "placeOfBirth") {
      // Clear stored coords when user edits the city field manually
      onChange({ ...formData, [key]: value, resolvedCoords: undefined });
      // Debounced geocode search
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim().length >= 2) {
        setIsSearching(true);
        debounceRef.current = setTimeout(async () => {
          const results = await searchCities(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
          setIsSearching(false);
        }, 300);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setIsSearching(false);
      }
    } else {
      onChange({ ...formData, [key]: value });
    }
  };

  const selectCity = useCallback((city: GeoResult) => {
    onChange({
      ...formData,
      placeOfBirth: city.displayName,
      resolvedCoords: {
        lat: city.latitude,
        lng: city.longitude,
        timezone: city.timezone,
      },
    });
    setSuggestions([]);
    setShowSuggestions(false);
  }, [formData, onChange]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (placeRef.current && !placeRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <motion.div className="flex h-full flex-col">

      {/* Back */}
      <motion.button
        type="button"
        onClick={onBack}
        className="self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline -mt-0.5 mr-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Headline */}
      <motion.h1
        className="mt-5 font-display text-2xl font-bold"
        style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        Your timing is unique.
      </motion.h1>
      <motion.p
        className="mt-1.5 text-sm"
        style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        Configure yours.
      </motion.p>

      {/* Form fields */}
      <div className="mt-5 space-y-3.5">
        {fields.map((field, i) => {
          const isPlaceField = field.key === "placeOfBirth";
          return (
            <motion.div
              key={field.key}
              ref={isPlaceField ? placeRef : undefined}
              className="relative rounded-2xl border border-border-light bg-bg-secondary px-4 py-3.5 transition-colors duration-200 focus-within:border-accent-purple"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.15, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            >
              <label>
                <span
                  className="font-medium uppercase"
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    color: "var(--accent-purple)",
                    opacity: 0.5,
                  }}
                >
                  {field.label}
                  {isPlaceField && isSearching && (
                    <span className="ml-2 normal-case" style={{ opacity: 0.4 }}>
                      searching…
                    </span>
                  )}
                </span>
                <input
                  type={field.type}
                  value={formData[field.key] as string}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onFocus={() => {
                    if (isPlaceField && suggestions.length > 0) setShowSuggestions(true);
                  }}
                  placeholder={field.placeholder}
                  autoComplete={isPlaceField ? "off" : undefined}
                  className="mt-1 w-full bg-transparent text-base font-medium outline-none placeholder:text-brand-5"
                  style={{ color: "var(--accent-purple)" }}
                />
              </label>
              {"helper" in field && field.helper && (
                <p
                  className="mt-1"
                  style={{ fontSize: 10, color: "var(--accent-purple)", opacity: 0.5 }}
                >
                  {field.helper}
                </p>
              )}

              {/* City autocomplete dropdown */}
              {isPlaceField && (
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      className="absolute left-0 right-0 z-50 mt-1 rounded-xl border overflow-hidden"
                      style={{
                        top: "100%",
                        background: "var(--bg-secondary)",
                        borderColor: "var(--border-light)",
                      }}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      {suggestions.map((city) => (
                        <button
                          key={city.id}
                          type="button"
                          onClick={() => selectCity(city)}
                          className="w-full px-4 py-2.5 text-left transition-colors hover:bg-brand-3/30"
                          style={{ color: "var(--accent-purple)" }}
                        >
                          <span className="text-sm font-medium">{city.name}</span>
                          {city.admin1 || city.country ? (
                            <span className="ml-1.5 text-xs" style={{ opacity: 0.5 }}>
                              {[city.admin1, city.country].filter(Boolean).join(", ")}
                            </span>
                          ) : null}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Reassurance */}
      <motion.p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        Your details are only used to prepare your personal rhythm.
      </motion.p>

      {/* CTA */}
      <motion.div
        className="mt-auto"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <button
          type="button"
          onClick={() => isValid && onNext()}
          className={`flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all ${
            isValid
              ? "bg-bg-brand text-text-on-brand shadow-lg active:scale-95"
              : "cursor-not-allowed bg-brand-4 text-text-disabled"
          }`}
        >
          Prepare my signal
        </button>
      </motion.div>
    </motion.div>
  );
}
