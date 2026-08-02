"use client";

import { useState, useEffect } from "react";

export interface CelebData {
  id: number;
  name: string;
  date: string;
  time: string;
  lat: number;
  lng: number;
  tz: string;
  city: string;
}

interface Props {
  accent: string;
  onSelect: (c: CelebData) => void;
}

export function CelebPicker({ accent, onSelect }: Props) {
  const [celebs, setCelebs] = useState<CelebData[]>([]);

  useEffect(() => {
    fetch("/api/celebs")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCelebs(data);
      })
      .catch(() => {});
  }, []);

  if (celebs.length === 0) return null;

  return (
    <select
      defaultValue=""
      onChange={(e) => {
        const celeb = celebs.find((c) => String(c.id) === e.target.value);
        if (celeb) {
          onSelect(celeb);
          e.target.value = ""; // reset so picker stays neutral after selection
        }
      }}
      style={{
        background: `color-mix(in srgb, ${accent} 8%, #1B1535)`,
        border: `1px solid color-mix(in srgb, ${accent} 28%, transparent)`,
        color: `color-mix(in srgb, ${accent} 90%, #E6E2F2)`,
        borderRadius: 8,
        padding: "4px 8px",
        fontSize: 11,
        fontFamily: "inherit",
        cursor: "pointer",
        outline: "none",
        maxWidth: 180,
      }}
    >
      <option value="" disabled>
        — try a celebrity —
      </option>
      {celebs.map((c) => (
        <option key={c.id} value={String(c.id)}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
