"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CelebPicker } from "@/components/landing/CelebPicker";

interface Props {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
}

// App design system — accent purple (matches globals.css --violet-9 / --accent-purple)
const ACCENT = "#7C6BBF";

// Static wave preview — SVG path approximating a ZR spirit wave
const WAVE_PATH =
  "M0,60 C20,60 30,30 60,28 C90,26 100,55 130,52 C160,49 170,10 200,8 C230,6 240,45 270,42 C300,39 310,65 340,62 C370,59 380,20 410,18 C440,16 450,50 480,48 C510,46 520,70 550,68 C580,66 590,30 620,28 C650,26 660,58 690,55 C720,52 730,15 760,12 C790,9 800,48 820,46";

interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  tz: string;
}

export function ZRSpiritTeaser({ eyebrow, title, sub, cta }: Props) {
  const [showForm, setShowForm]     = useState(false);
  const [name, setName]             = useState("");
  const [date, setDate]             = useState("");
  const [time, setTime]             = useState("");
  const [cityInput, setCityInput]   = useState("");
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [selectedCity, setSelectedCity] = useState<GeoResult | null>(null);
  const [formError, setFormError]   = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [loadStep, setLoadStep]     = useState(0);

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

  const STEPS = [
    "Casting natal chart…",
    "Locating Lot of Spirit…",
    "Generating L1 periods…",
    "Mapping L2 sub-periods…",
    "Rendering Spirit Wave…",
  ];

  const handleSubmit = async () => {
    if (!name.trim())    { setFormError("Please enter your name."); return; }
    if (!date)           { setFormError("Please enter your birth date."); return; }
    if (!time)           { setFormError("Please enter your birth time."); return; }
    if (!selectedCity)   { setFormError("Please select a city from the list."); return; }

    // Open blank tab immediately (avoids popup blocker)
    const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Computing Spirit Wave…</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
<style>*{box-sizing:border-box;margin:0;padding:0}body{background:#F5F1FA;color:#150F2A;font-family:'Inter',sans-serif;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:24px}.card{text-align:center;max-width:380px}.orbit{position:relative;width:90px;height:90px;margin:0 auto 28px}.ring{position:absolute;inset:0;border-radius:50%;border:2px solid transparent;animation:spin 3s linear infinite}.ring-1{border-top-color:#7C6BBF;border-right-color:rgba(124,107,191,.3)}.ring-2{inset:11px;border-top-color:rgba(124,107,191,.6);animation-duration:2s;animation-direction:reverse}.ring-3{inset:22px;border-top-color:rgba(124,107,191,.4);animation-duration:4s}.dot{position:absolute;inset:37px;background:#7C6BBF;border-radius:50%;opacity:.8;animation:pulse 2s ease-in-out infinite}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.2);opacity:1}}h1{font-size:20px;font-weight:700;color:#150F2A;margin-bottom:8px}p{font-size:12px;color:#8C7FAE;line-height:1.6;margin-bottom:20px}.steps{list-style:none;text-align:left;display:inline-block}.steps li{font-size:11px;color:#A397C0;padding:3px 0;display:flex;align-items:center;gap:7px}.steps li::before{content:"";width:5px;height:5px;border-radius:50%;background:rgba(124,107,191,.4);flex-shrink:0;animation:blink 1.4s ease-in-out infinite}.steps li:nth-child(1)::before{animation-delay:0s}.steps li:nth-child(2)::before{animation-delay:.28s}.steps li:nth-child(3)::before{animation-delay:.56s}.steps li:nth-child(4)::before{animation-delay:.84s}.steps li:nth-child(5)::before{animation-delay:1.12s}@keyframes blink{0%,100%{opacity:.4}50%{opacity:1;background:#7C6BBF}}</style></head><body>
<div class="card"><div class="orbit"><div class="ring ring-1"></div><div class="ring ring-2"></div><div class="ring ring-3"></div><div class="dot"></div></div>
<h1>Computing your Spirit Wave</h1>
<p>Calculating Zodiacal Releasing (Lot of Spirit)<br>for <strong style="color:#7C6BBF">${name.trim()}</strong>. This takes ~20 seconds.</p>
<ul class="steps"><li>Casting natal chart positions</li><li>Locating Lot of Spirit</li><li>Generating L1 major periods</li><li>Mapping L2 sub-periods & markers</li><li>Rendering wave visualization</li></ul></div></body></html>`);
      win.document.close();
    }

    setIsLoading(true);
    setLoadStep(0);
    let step = 0;
    const timer = setInterval(() => {
      step = Math.min(step + 1, STEPS.length - 1);
      setLoadStep(step);
    }, 3500);

    try {
      const params = new URLSearchParams({
        name:      name.trim(),
        birthDate: date,
        birthTime: time,
        city:      selectedCity.displayName,
        timezone:  selectedCity.tz,
        lat:       String(selectedCity.lat),
        lng:       String(selectedCity.lng),
      });
      const res  = await fetch(`/api/zr-spirit-report?${params.toString()}`);
      const html = await res.text();
      if (win && !win.closed) {
        localStorage.setItem("report:spirit-wave", html);
        win.location.href = "/app/spirit-wave";
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(`Could not generate report: ${msg}`);
      if (win && !win.closed) win.close();
    } finally {
      clearInterval(timer);
      setIsLoading(false);
      setLoadStep(0);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: `color-mix(in srgb, ${ACCENT} 7%, var(--bg-primary, #1B1535))`,
    border: `1px solid color-mix(in srgb, ${ACCENT} 25%, transparent)`,
    color: "var(--text-heading, #E6E2F2)",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

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
        background: `color-mix(in srgb, ${ACCENT} 6%, var(--bg-primary, #1B1535))`,
        borderColor: `color-mix(in srgb, ${ACCENT} 20%, transparent)`,
      }}
    >
      {/* Premium badge */}
      <div className="absolute right-6 top-6">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: ACCENT, color: "#F5F1FA" }}
        >
          Premium
        </span>
      </div>

      {/* Copy + CTA */}
      <div className="px-10 pt-12 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: ACCENT }}>
          {eyebrow}
        </p>
        <h2
          className="mt-3 font-display text-[30px] font-bold leading-tight"
          style={{ color: "var(--text-heading, #E6E2F2)", letterSpacing: -0.5 }}
        >
          {title}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed" style={{ color: "var(--text-body-subtle, #BFB6D6)" }}>
          {sub}
        </p>

        <div className="mt-6">
          {!showForm ? (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-transform hover:scale-105"
                style={{ background: ACCENT, color: "#F5F1FA" }}
              >
                {cta}
                <span aria-hidden>→</span>
              </button>
              <Link
                href="/app/pricing"
                className="text-[13px] font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--text-body-subtle, #BFB6D6)" }}
              >
                Subscribe →
              </Link>
            </div>
          ) : null}
        </div>

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
                className="mt-6 rounded-2xl p-6"
                style={{
                  background: `color-mix(in srgb, ${ACCENT} 5%, var(--bg-primary, #1B1535))`,
                  border: `1px solid color-mix(in srgb, ${ACCENT} 16%, transparent)`,
                }}
              >
                <div className="mb-5 flex items-center justify-between gap-3">
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
                  <div>
                    <label style={labelStyle}>Your name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setFormError(""); }}
                      placeholder="e.g. Alex"
                      style={inputStyle}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label style={labelStyle}>Birth date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => { setDate(e.target.value); setFormError(""); }}
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Birth time</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => { setTime(e.target.value); setFormError(""); }}
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* City — Nominatim autocomplete */}
                  <div ref={cityRef}>
                    <label style={labelStyle}>City of birth</label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => handleCityInput(e.target.value)}
                      placeholder="Type a city… e.g. Antwerp, Brussels"
                      style={inputStyle}
                      autoComplete="off"
                    />
                    {suggestions.length > 0 && (
                      <ul style={{
                        marginTop: 6, listStyle: "none", padding: 0,
                        border: `1px solid color-mix(in srgb, ${ACCENT} 25%, transparent)`,
                        borderRadius: 10,
                        background: `color-mix(in srgb, ${ACCENT} 6%, var(--bg-primary, #F5F1FA))`,
                        overflow: "hidden",
                      }}>
                        {suggestions.map((c) => (
                          <li key={c.displayName} style={{ borderBottom: `1px solid color-mix(in srgb, ${ACCENT} 10%, transparent)` }}>
                            <button
                              type="button"
                              onMouseDown={() => selectCity(c)}
                              style={{
                                width: "100%", textAlign: "left", padding: "10px 14px",
                                fontSize: 13, color: "var(--text-heading, #150F2A)",
                                background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = `color-mix(in srgb, ${ACCENT} 12%, transparent)`)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {c.displayName}
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

                <div className="mt-5 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[13px] font-semibold transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
                    style={{ background: ACCENT, color: "#F5F1FA" }}
                  >
                    {isLoading ? (
                      <>
                        <span
                          className="h-3.5 w-3.5 rounded-full border-2 border-sky-900/40 border-t-sky-900 animate-spin"
                          style={{ display: "inline-block", flexShrink: 0 }}
                        />
                        {STEPS[loadStep]}
                      </>
                    ) : (
                      <>Generate my Spirit Wave <span aria-hidden>→</span></>
                    )}
                  </button>
                  {!isLoading && (
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                      className="text-[12px] transition-opacity hover:opacity-60"
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

      {/* Wave preview */}
      <div
        className="relative mx-8 mb-0 overflow-hidden rounded-t-2xl border-t border-x"
        style={{
          borderColor: `color-mix(in srgb, ${ACCENT} 16%, transparent)`,
          height: "200px",
        }}
      >
        <div
          style={{
            background: "linear-gradient(180deg, #090d1e, #070a19)",
            padding: "18px 20px 0",
            height: "100%",
          }}
        >
          {/* Mini header */}
          <div className="mb-4 flex items-center justify-between">
            <span style={{ fontSize: 10, fontWeight: 700, color: ACCENT, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Spirit Wave · Zodiacal Releasing L2
            </span>
            <span style={{ fontSize: 9, color: "#374151" }}>L1 bands · Cu markers</span>
          </div>

          {/* SVG wave preview */}
          <svg
            viewBox="0 0 820 90"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "120px", display: "block" }}
          >
            {/* L1 background bands */}
            <rect x="0"   y="0" width="180" height="90" fill="rgba(249,115,22,0.07)" />
            <rect x="180" y="0" width="220" height="90" fill="rgba(96,165,250,0.07)" />
            <rect x="400" y="0" width="200" height="90" fill="rgba(34,197,94,0.07)"  />
            <rect x="600" y="0" width="220" height="90" fill="rgba(234,179,8,0.07)"  />
            {/* Gradient fill under wave */}
            <defs>
              <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#7C6BBF" stopOpacity="0.18"/>
                <stop offset="100%" stopColor="#7C6BBF" stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={WAVE_PATH + " L820,90 L0,90 Z"} fill="url(#wg)" />
            {/* Wave line */}
            <path d={WAVE_PATH} fill="none" stroke="rgba(255,255,255,0.78)" strokeWidth="1.5" strokeLinecap="round"/>
            {/* Cu markers (white large dots) */}
            <circle cx="200" cy="8"  r="5" fill="white" opacity="0.9"/>
            <circle cx="410" cy="18" r="5" fill="white" opacity="0.9"/>
            <circle cx="760" cy="12" r="5" fill="white" opacity="0.9"/>
            {/* LB markers (red dots) */}
            <circle cx="340" cy="62" r="4" fill="#ffffff" opacity="0.85"/>
            <circle cx="620" cy="28" r="4" fill="#ffffff" opacity="0.85"/>
            {/* Regular dots */}
            <circle cx="60"  cy="28" r="3" fill="#F97316" opacity="0.7"/>
            <circle cx="130" cy="52" r="3" fill="#F97316" opacity="0.7"/>
            <circle cx="270" cy="42" r="3" fill="#60A5FA" opacity="0.7"/>
            <circle cx="480" cy="48" r="3" fill="#22C55E" opacity="0.7"/>
            <circle cx="550" cy="68" r="3" fill="#22C55E" opacity="0.7"/>
            <circle cx="690" cy="55" r="3" fill="#EAB308" opacity="0.7"/>
            <circle cx="820" cy="46" r="3" fill="#EAB308" opacity="0.7"/>
            {/* Now line */}
            <line x1="580" y1="0" x2="580" y2="90" stroke="rgba(125,211,252,0.5)" strokeWidth="1.5" strokeDasharray="4,4"/>
            <text x="583" y="12" fill="#7C6BBF" fontSize="8" opacity="0.7">now</text>
          </svg>

          {/* Mini legend */}
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap" }}>
            {[
              { color: "#ffffff", label: "Cu culmination" },
              { color: "#ffffff", label: "LB loosing ✿" },
              { color: "#7C6BBF", label: "current" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: "#4b5563" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Fade at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${ACCENT} 6%, var(--bg-primary, #1B1535)))`,
          }}
        />
      </div>
    </div>
  );
}
