"use client";

import { useEffect, useState } from "react";

interface ProfectionYear {
  year?: number;
  age?: number;
  sign?: string;
  house?: number;
  lord?: string;
  themes?: string[];
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  [key: string]: unknown;
}

interface ProfectionData {
  currentYear?: ProfectionYear;
  years?: ProfectionYear[];
  profectionYear?: number;
  activatedHouse?: number;
  lord?: string;
  sign?: string;
  [key: string]: unknown;
}

const SIGN_COLORS: Record<string, string> = {
  Aries: "#E06060", Taurus: "#70A870", Gemini: "#D0C060", Cancer: "#80A8C0",
  Leo: "#E0A040", Virgo: "#90B880", Libra: "#C090C0", Scorpio: "#904060",
  Sagittarius: "#E08040", Capricorn: "#708090", Aquarius: "#60A0C0", Pisces: "#8080C0",
};

export default function ProfectionsPage() {
  const [data, setData] = useState<ProfectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/astrolearn/profections")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d.data || d);
      })
      .catch(() => setError("Failed to load profections"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-[#9585CC] border-t-transparent animate-spin" />
        <p className="text-[#8C7FAE] text-sm">Calculating profections…</p>
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

  const currentYear = data?.currentYear ?? null;
  const sign = (currentYear?.sign || data?.sign) as string | undefined;
  const lord = (currentYear?.lord || data?.lord) as string | undefined;
  const house = (currentYear?.house || data?.activatedHouse) as number | undefined;
  const themes = Array.isArray(currentYear?.themes) ? (currentYear!.themes as string[]) : [];
  const years: ProfectionYear[] = Array.isArray(data?.years) ? (data!.years as ProfectionYear[]) : [];
  const signColor = sign ? (SIGN_COLORS[sign] ?? "#9585CC") : "#9585CC";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Profections</h1>
        <p className="text-sm text-[#8C7FAE] mt-1">Annual timing · one house per year</p>
      </div>

      {/* Current year hero card */}
      {sign && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{
            background: `radial-gradient(ellipse at top, ${signColor}15 0%, rgba(19,15,39,0.9) 70%)`,
            border: `1px solid ${signColor}35`,
          }}
        >
          <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: signColor, opacity: 0.8 }}>
            This Year
          </div>
          <div className="text-5xl font-bold text-white mb-2" style={{ letterSpacing: "-0.02em" }}>
            {sign}
          </div>
          {house && (
            <div className="text-sm font-semibold mb-4" style={{ color: signColor }}>
              House {house}
            </div>
          )}
          {lord && (
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mx-auto"
              style={{ background: `${signColor}12`, border: `1px solid ${signColor}30` }}
            >
              <span className="text-xs text-[#8C7FAE]">Lord of the year</span>
              <span className="text-sm font-bold" style={{ color: signColor }}>{lord}</span>
            </div>
          )}
          {themes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {themes.map((t, i) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: `${signColor}10`, color: signColor, border: `1px solid ${signColor}20` }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Year-by-year list */}
      {years.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-[#4A4070] uppercase tracking-widest">Year by Year</h2>
          <div className="space-y-1.5">
            {years.map((y, i) => {
              const yColor = y.sign ? (SIGN_COLORS[y.sign] ?? "#8C7FAE") : "#8C7FAE";
              return (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl px-4 py-3"
                  style={{
                    background: y.isCurrent ? `${yColor}10` : "rgba(19,15,39,0.5)",
                    border: `1px solid ${y.isCurrent ? yColor + "35" : "rgba(46,38,84,0.35)"}`,
                  }}
                >
                  {y.age != null && (
                    <span className="text-xs font-mono text-[#4A4070] w-7 flex-shrink-0 text-right">
                      {y.age}
                    </span>
                  )}
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: yColor }} />
                  <span className="flex-1 text-sm font-semibold" style={{ color: y.isCurrent ? "white" : "#9ca3af" }}>
                    {y.sign ?? "—"}
                  </span>
                  {y.house && (
                    <span className="text-xs font-mono text-[#4A4070]">H{y.house}</span>
                  )}
                  {y.lord && (
                    <span className="text-xs text-[#8C7FAE]">{y.lord}</span>
                  )}
                  {y.isCurrent && (
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${yColor}15`, color: yColor, border: `1px solid ${yColor}30` }}
                    >
                      NOW
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
