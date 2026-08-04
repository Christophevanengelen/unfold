"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CelebPicker } from "@/components/landing/CelebPicker";
import { DateInput } from "@/components/ui/DateInput";

interface Props {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
}

const ACCENT = "#7C6BBF";

// Static preview rows — fake Solar Return data (fire/earth/air/water)
const PREVIEW_ROWS = [
  { year: 2024, element: "water", color: "#60A5FA", pivotal: false, theme: "House 7 · Relationships" },
  { year: 2025, element: "fire",  color: "#F97316", pivotal: true,  badge: "★ Top 10", theme: "House 1 · Identity" },
  { year: 2026, element: "earth", color: "#22C55E", pivotal: false, theme: "House 10 · Career" },
  { year: 2027, element: "air",   color: "#EAB308", pivotal: true,  badge: "Pivotal", theme: "House 5 · Creativity" },
  { year: 2028, element: "water", color: "#60A5FA", pivotal: false, theme: "House 2 · Resources" },
  { year: 2029, element: "fire",  color: "#F97316", pivotal: true,  badge: "★ Top 10", theme: "House 9 · Expansion" },
  { year: 2030, element: "earth", color: "#22C55E", pivotal: false, theme: "House 4 · Home" },
];

interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  tz: string;
}

export function BirthdayGraphTeaser({ eyebrow, title, sub, cta }: Props) {
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null);
  const [formError, setFormError] = useState("");

  const cityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCityInput = (val: string) => {
    setCityInput(val);
    setSelectedCity(null);
    setFormError("");
    if (val.trim().length < 2) { setSuggestions([]); return; }
    fetch(`/api/geocode?q=${encodeURIComponent(val.trim())}`)
      .then((r) => r.json())
      .then((data) => {
        const results: GeoResult[] = (data.results ?? []).map((r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone?: string }) => ({
          displayName: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
          lat: r.latitude,
          lng: r.longitude,
          tz: r.timezone ?? "UTC",
        }));
        setSuggestions(results);
      })
      .catch(() => setSuggestions([]));
  };

  const selectCity = (city: GeoResult) => {
    setCityInput(city.displayName);
    setSelectedCity(city);
    setSuggestions([]);
  };

  const [isComputing, setIsComputing] = useState(false);
  const [computeStep, setComputeStep] = useState(0);

  const COMPUTE_STEPS = [
    "Locating birth position…",
    "Calculating Solar Returns…",
    "Scoring pivotal years…",
    "Mapping angular peaks…",
    "Rendering Birthday Graph…",
  ];

  const handleSubmit = async () => {
    if (!name.trim()) { setFormError("Please enter your name."); return; }
    if (!date) { setFormError("Please enter your birth date."); return; }
    if (!time) { setFormError("Please enter your birth time."); return; }
    if (!selectedCity) { setFormError("Please select a city from the list."); return; }

    // Open new tab immediately (avoids popup blocker)
    const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Computing Birthday Graph…</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1FA;color:#150F2A;font-family:'Inter',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:24px}.card{text-align:center;max-width:380px}.orbit{position:relative;width:90px;height:90px;margin:0 auto 28px}.ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;animation:spin 3s linear infinite}.ring-1{border-top-color:#7C6BBF;border-right-color:rgba(124,107,191,.3)}.ring-2{inset:11px;border-top-color:rgba(124,107,191,.6);animation-duration:2s;animation-direction:reverse}.ring-3{inset:22px;border-top-color:rgba(124,107,191,.4);animation-duration:4s}.dot{position:absolute;inset:37px;background:#7C6BBF;border-radius:50%;opacity:.8;animation:pulse 2s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.2);opacity:1}}h1{font-size:20px;font-weight:700;color:#150F2A;margin-bottom:8px}p{font-size:12px;color:#8C7FAE;line-height:1.6;margin-bottom:20px}.steps{list-style:none;text-align:left;display:inline-block}.steps li{font-size:11px;color:#A397C0;padding:3px 0;display:flex;align-items:center;gap:7px}.steps li::before{content:"";width:5px;height:5px;border-radius:50%;background:rgba(124,107,191,.4);flex-shrink:0;animation:blink 1.4s ease-in-out infinite}.steps li:nth-child(1)::before{animation-delay:0s}.steps li:nth-child(2)::before{animation-delay:.28s}.steps li:nth-child(3)::before{animation-delay:.56s}.steps li:nth-child(4)::before{animation-delay:.84s}.steps li:nth-child(5)::before{animation-delay:1.12s}@keyframes blink{0%,100%{opacity:.4}50%{opacity:1;background:#7C6BBF}}</style></head><body>
<div class="card"><div class="orbit"><div class="ring ring-1"></div><div class="ring ring-2"></div><div class="ring ring-3"></div><div class="dot"></div></div>
<h1>Computing your Birthday Graph</h1>
<p>Calculating Solar Returns year by year<br>for <strong style="color:#7C6BBF">${name.trim()}</strong>. This takes ~30 seconds.</p>
<ul class="steps"><li>Casting natal chart positions</li><li>Calculating each Solar Return</li><li>Scoring pivotal years</li><li>Finding angular peak years</li><li>Rendering visualization</li></ul></div></body></html>`);
      win.document.close();
    }

    setIsComputing(true);
    setComputeStep(0);
    let step = 0;
    const stepTimer = setInterval(() => {
      step = Math.min(step + 1, COMPUTE_STEPS.length - 1);
      setComputeStep(step);
    }, 4500);

    try {
      const params = new URLSearchParams({
        name: name.trim(),
        date,
        time,
        city: selectedCity.displayName,
        tz: selectedCity.tz,
        lat: String(selectedCity.lat),
        lng: String(selectedCity.lng),
      });
      const res = await fetch(`/api/birthday-report?${params.toString()}`);
      const html = await res.text();
      if (win && !win.closed) {
        localStorage.setItem("report:birthday-graph", html);
        win.location.href = "/app/birthday-graph";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(`Could not generate graph: ${msg}`);
      if (win && !win.closed) win.close();
    } finally {
      clearInterval(stepTimer);
      setIsComputing(false);
      setComputeStep(0);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: `color-mix(in srgb, ${ACCENT} 7%, var(--bg-primary, #1B1535))`,
    border: `1px solid color-mix(in srgb, ${ACCENT} 25%, transparent)`,
    color: "var(--text-heading, #E6E2F2)",
    borderRadius: 10,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  /**
   * Padding + font-size live in classes (not in `inputStyle`) so mobile gets a
   * 44px-tall touch target and a 16px font (under 16px iOS Safari zooms in on
   * focus). `md:` restores the original `10px 14px` / `13px` exactly.
   */
  const inputClass = "px-[14px] py-3.5 text-[16px] md:py-[10px] md:text-[13px]";

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: ACCENT,
    opacity: 0.7,
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      className="relative rounded-3xl border text-left"
      style={{
        background: `color-mix(in srgb, ${ACCENT} 7%, var(--bg-primary, #1B1535))`,
        borderColor: `color-mix(in srgb, ${ACCENT} 22%, transparent)`,
      }}
    >
      {/* Premium badge */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: ACCENT, color: "#fff" }}
        >
          Premium
        </span>
      </div>

      {/* Copy + CTA */}
      <div className="px-5 pt-11 pb-6 md:px-10 md:pt-12 md:pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
          {eyebrow}
        </p>
        <h2
          className="mt-3 font-display text-[24px] font-bold leading-tight md:text-[30px]"
          style={{ color: "var(--text-heading, #E6E2F2)", letterSpacing: -0.5 }}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
          {sub}
        </p>

        {/* CTA */}
        <div className="mt-6">
          {!showForm ? (
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold transition-transform hover:scale-105 md:w-auto md:justify-start md:py-3"
                style={{ background: ACCENT, color: "#fff" }}
              >
                {cta}
                <span aria-hidden>→</span>
              </button>
              <Link
                href="/app/pricing"
                className="py-2 text-center text-[13px] font-medium transition-opacity hover:opacity-70 md:py-0"
                style={{ color: "var(--text-body-subtle, #BFB6D6)" }}
              >
                Subscribe →
              </Link>
            </div>
          ) : null}
        </div>

        {/* Slide-in form or confirmation */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              key="form"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="mt-6 rounded-2xl p-4 md:p-6"
                style={{
                  background: `color-mix(in srgb, ${ACCENT} 5%, var(--bg-primary, #1B1535))`,
                  border: `1px solid color-mix(in srgb, ${ACCENT} 18%, transparent)`,
                }}
              >
                <div className="mb-5 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: ACCENT }}>
                    Enter your birth data
                  </p>
                  <CelebPicker accent={ACCENT} onSelect={(c) => {
                    setName(c.name);
                    setDate(c.date);
                    setTime(c.time);
                    setCityInput(c.city);
                    setSelectedCity({ displayName: c.city, lat: c.lat, lng: c.lng, tz: c.tz });
                    setFormError("");
                  }} />
                </div>

                <div className="flex flex-col gap-4">
                  {/* Name */}
                  <div>
                    <label style={labelStyle}>Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setFormError(""); }}
                      placeholder="e.g. Alex"
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label style={labelStyle}>Birth date</label>
                    <DateInput
                      value={date}
                      onChange={(value) => { setDate(value); setFormError(""); }}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label style={labelStyle}>Birth time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => { setTime(e.target.value); setFormError(""); }}
                      className={inputClass}
                      style={inputStyle}
                    />
                  </div>

                  {/* City — inline suggestions (no absolute positioning, no overflow clip) */}
                  <div ref={cityRef}>
                    <label style={labelStyle}>City of birth</label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => handleCityInput(e.target.value)}
                      placeholder="Type a city… e.g. Paris, Tokyo"
                      className={inputClass}
                      style={inputStyle}
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul
                        // Mobile caps the list so a long result set can't push the
                        // submit button off-screen; `md:` restores the un-capped list.
                        className="max-h-60 overflow-auto md:max-h-none md:overflow-hidden"
                        style={{
                          marginTop: 6,
                          listStyle: "none",
                          padding: 0,
                          border: `1px solid color-mix(in srgb, ${ACCENT} 25%, transparent)`,
                          borderRadius: 10,
                          background: `color-mix(in srgb, ${ACCENT} 6%, var(--bg-primary, #1B1535))`,
                        }}
                      >
                        {suggestions.map((city) => (
                          <li key={city.displayName} style={{ borderBottom: `1px solid color-mix(in srgb, ${ACCENT} 10%, transparent)` }}>
                            <button
                              type="button"
                              onMouseDown={() => selectCity(city)}
                              className="px-[14px] py-3 text-[14px] md:py-[10px] md:text-[13px]"
                              style={{
                                width: "100%",
                                textAlign: "left",
                                color: "var(--text-heading, #E6E2F2)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = `color-mix(in srgb, ${ACCENT} 12%, transparent)`)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {city.displayName}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedCity && (
                      <p style={{ fontSize: 11, color: ACCENT, marginTop: 4, opacity: 0.8 }}>
                        ✓ {selectedCity.displayName} · {selectedCity.tz}
                      </p>
                    )}
                  </div>
                </div>

                {formError && (
                  <p className="mt-3 text-[12px]" style={{ color: "#e57373" }}>{formError}</p>
                )}

                <div className="mt-5 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isComputing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-center text-[13px] font-semibold transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 md:w-auto md:justify-start md:py-3"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    {isComputing ? (
                      <>
                        <span
                          className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                          style={{ display: "inline-block", flexShrink: 0 }}
                        />
                        Computing…
                      </>
                    ) : (
                      <>Generate my graph <span aria-hidden>→</span></>
                    )}
                  </button>
                  {!isComputing && (
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                      className="py-2 text-[12px] transition-opacity hover:opacity-60 md:py-0"
                      style={{ color: "var(--text-body-subtle, #BFB6D6)" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* CSS preview — Solar Return year grid */}
      <div
        className="relative mx-4 mb-0 h-[210px] overflow-hidden rounded-t-2xl border-t border-x md:mx-8 md:h-[260px]"
        style={{
          borderColor: `color-mix(in srgb, ${ACCENT} 18%, transparent)`,
        }}
      >
        <div
          className="h-full px-3 pt-4 md:px-5 md:pt-[18px]"
          style={{
            background: "linear-gradient(180deg, #090d1e, #070a19)",
            overflowY: "hidden",
          }}
        >
          {/* Mini header */}
          <div className="mb-3 flex items-center justify-between">
            <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Birthday Stories · Solar Return
            </span>
            {/* Secondary label has no room next to the title on a phone */}
            <span className="hidden md:inline" style={{ fontSize: 9, color: "#4b5569" }}>100 years</span>
          </div>

          {/* Year rows */}
          {PREVIEW_ROWS.map((row) => (
            <div
              key={row.year}
              className="mb-2 flex items-center gap-2 rounded-lg px-2.5 py-2 md:gap-3 md:px-3"
              style={{
                background: `color-mix(in srgb, ${row.color} 6%, rgba(255,255,255,0.02))`,
                border: `1px solid color-mix(in srgb, ${row.color} 14%, transparent)`,
              }}
            >
              {/* Element dot */}
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: row.color,
                  flexShrink: 0,
                  boxShadow: `0 0 6px ${row.color}66`,
                }}
              />
              {/* Year */}
              <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", width: 36, flexShrink: 0 }}>
                {row.year}
              </span>
              {/* Theme — truncates instead of wrapping to a second line on narrow cards */}
              <span
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  flex: 1,
                  minWidth: 0,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {row.theme}
              </span>
              {/* Badge */}
              {row.pivotal && (
                <span
                  style={{
                    fontSize: 8,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 20,
                    background: `color-mix(in srgb, ${ACCENT} 20%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${ACCENT} 35%, transparent)`,
                    color: ACCENT,
                    whiteSpace: "nowrap",
                  }}
                >
                  {row.badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Fade at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${ACCENT} 7%, var(--bg-primary, #1B1535)))`,
          }}
        />
      </div>
    </div>
  );
}
