"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { CelebPicker } from "@/components/landing/CelebPicker";
import { DateInput } from "@/components/ui/DateInput";
import { verifierCode, CLE_ACCES } from "@/lib/coupons";

interface Props {
  chartCta: string;
  chartEyebrow: string;
  chartTitle: string;
  chartSub: string;
}


const GOLD = "var(--site-or)";

interface GeoResult {
  displayName: string;
  lat: number;
  lng: number;
  tz: string;
}

export function LifetimeChartTeaser({ chartCta, chartEyebrow, chartTitle, chartSub }: Props) {
  const [hasAccess, setHasAccess] = useState(false);

  // Coupon gate state
  const [showCoupon, setShowCoupon] = useState(false);
  const [code, setCode] = useState("");
  const [couponError, setCouponError] = useState("");

  // Birth data form state
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
    try {
      setHasAccess(localStorage.getItem(CLE_ACCES) === "true");
    } catch {}
  }, []);

  // Close city dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const tryCode = () => {
    const etat = verifierCode(code);
    if (etat === "ok") {
      try { localStorage.setItem(CLE_ACCES, "true"); } catch {}
      setHasAccess(true);
      setShowCoupon(false);
      window.location.href = "/app/boudin";
    } else {
      // Voir lib/coupons.ts : « inactif » veut dire qu aucun code n existe,
      // ce qui n est pas la faute de la personne qui vient d en saisir un.
      setCouponError(
        etat === "inactif"
          ? "Access codes aren't active right now. It's not you."
          : "This code isn't recognized. Try again or subscribe to get access.",
      );
    }
  };

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
  const [reportHtml, setReportHtml] = useState<string | null>(null);

  const COMPUTE_STEPS = [
    "Locating birth coordinates…",
    "Casting natal chart positions…",
    "Tracing 100-year planetary cycles…",
    "Mapping momentum phases…",
    "Rendering your timeline…",
  ];

  const handleGenerate = async () => {
    if (!name.trim()) { setFormError("Please enter your name."); return; }
    if (!date) { setFormError("Please enter your birth date."); return; }
    if (!time) { setFormError("Please enter your birth time."); return; }
    if (!selectedCity) { setFormError("Please select a city from the list."); return; }

    setIsComputing(true);
    setComputeStep(0);

    // Cycle through step messages while the API computes
    let step = 0;
    const stepTimer = setInterval(() => {
      step = Math.min(step + 1, COMPUTE_STEPS.length - 1);
      setComputeStep(step);
    }, 6000);

    try {
      const res = await fetch("/api/lifetime-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          birthDate: date,
          birthTime: time,
          timezone: selectedCity.tz,
          lat: selectedCity.lat,
          lng: selectedCity.lng,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error ?? `HTTP ${res.status}`);
      }

      const html = await res.text();
      setReportHtml(html);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setFormError(`Could not generate chart: ${msg}`);
    } finally {
      clearInterval(stepTimer);
      setIsComputing(false);
      setComputeStep(0);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: `color-mix(in srgb, ${GOLD} 8%, var(--bg-primary))`,
    border: `1px solid color-mix(in srgb, ${GOLD} 28%, transparent)`,
    color: "var(--text-heading)",
    borderRadius: 10,
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
  };

  /**
   * Padding + font-size live in classes (not in `inputStyle`) so mobile can get
   * a 44px-tall touch target and a 16px font — below 16px iOS Safari zooms the
   * viewport on focus. From `md:` up the values collapse back to the original
   * `10px 14px` / `13px`, so the desktop rendering is byte-identical.
   */
  const inputClass = "px-[14px] py-3.5 text-[16px] md:py-[10px] md:text-[13px]";

  const labelStyle: React.CSSProperties = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: GOLD,
    opacity: 0.7,
    marginBottom: 4,
    display: "block",
  };

  return (
    <div
      className="relative rounded-3xl border text-left"
      style={{
        background: `color-mix(in srgb, ${GOLD} 7%, var(--bg-primary))`,
        borderColor: `color-mix(in srgb, ${GOLD} 22%, transparent)`,
      }}
    >
      {/* Premium badge */}
      <div className="absolute right-4 top-4 md:right-6 md:top-6">
        <span
          className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: GOLD, color: "var(--site-texte-sur-aplat)" }}
        >
          Premium
        </span>
      </div>

      {/* Copy + CTA */}
      <div className="px-5 pt-11 pb-6 md:px-10 md:pt-12 md:pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>
          {chartEyebrow}
        </p>
        <h2
          className="mt-3 font-display text-[24px] font-bold leading-tight md:text-[30px]"
          style={{ color: "var(--text-heading)", letterSpacing: -0.5 }}
        >
          {chartTitle}
        </h2>
        <p className="mt-3 max-w-lg text-[14px] leading-relaxed" style={{ color: "var(--text-body-subtle)" }}>
          {chartSub}
        </p>

        {/* CTA area */}
        <div className="mt-6">
          {/* Always show the form flow → opens desktop HTML report */}
          {!showForm && !showCoupon ? (
            // Default state — primary + secondary CTAs
            <div className="flex flex-col items-stretch gap-3 md:flex-row md:flex-wrap md:items-center">
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[13px] font-semibold transition-transform hover:scale-105 md:w-auto md:justify-start md:py-3"
                style={{ background: GOLD, color: "var(--site-texte-sur-aplat)" }}
              >
                {chartCta}
                <span aria-hidden>→</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCoupon(true)}
                className="py-2 text-center text-[13px] font-medium transition-opacity hover:opacity-70 md:py-0"
                style={{ color: GOLD }}
              >
                I have a coupon ↓
              </button>
              <Link
                href="/app/pricing"
                className="py-2 text-center text-[13px] font-medium transition-opacity hover:opacity-70 md:py-0"
                style={{ color: "var(--text-body-subtle)" }}
              >
                Subscribe →
              </Link>
            </div>
          ) : showCoupon ? (
            // Coupon entry
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => { setCode(e.target.value); setCouponError(""); }}
                  onKeyDown={(e) => e.key === "Enter" && tryCode()}
                  placeholder="COUPON CODE"
                  autoFocus
                  className="w-full rounded-full px-4 py-3 text-[16px] font-semibold uppercase tracking-widest outline-none md:w-[200px] md:py-2.5 md:text-[13px]"
                  style={{
                    background: `color-mix(in srgb, ${GOLD} 12%, var(--bg-primary))`,
                    border: `1px solid color-mix(in srgb, ${GOLD} 35%, transparent)`,
                    color: GOLD,
                  }}
                />
                <button
                  type="button"
                  onClick={tryCode}
                  className="rounded-full px-5 py-3 text-[13px] font-semibold transition-opacity hover:opacity-80 md:py-2.5"
                  style={{ background: GOLD, color: "var(--site-texte-sur-aplat)" }}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCoupon(false); setCouponError(""); }}
                  className="py-2 text-[12px] transition-opacity hover:opacity-60 md:py-0"
                  style={{ color: "var(--text-body-subtle)" }}
                >
                  Cancel
                </button>
              </div>
              {couponError && (
                <p className="text-[12px]" style={{ color: "var(--site-texte-erreur)" }}>
                  {couponError}{" "}
                  <Link href="/app/pricing" style={{ color: GOLD }}>Get access →</Link>
                </p>
              )}
            </div>
          ) : null}
        </div>

        {/* Slide-in birth data form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="mt-6 rounded-2xl p-4 md:p-6"
                style={{
                  background: `color-mix(in srgb, ${GOLD} 5%, var(--bg-primary))`,
                  border: `1px solid color-mix(in srgb, ${GOLD} 18%, transparent)`,
                }}
              >
                <div className="mb-5 flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-3">
                  <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: GOLD }}>
                    Enter your birth data
                  </p>
                  <CelebPicker accent={GOLD} onSelect={(c) => {
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

                  {/* City — inline suggestions (avoids overflow-hidden clipping) */}
                  <div ref={cityRef}>
                    <label style={labelStyle}>City of birth</label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => handleCityInput(e.target.value)}
                      placeholder="Type a city… e.g. Paris, Brussels"
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
                          border: `1px solid color-mix(in srgb, ${GOLD} 25%, transparent)`,
                          borderRadius: 10,
                          background: `color-mix(in srgb, ${GOLD} 6%, var(--bg-primary))`,
                        }}
                      >
                        {suggestions.map((city) => (
                          <li key={city.displayName} style={{ borderBottom: `1px solid color-mix(in srgb, ${GOLD} 10%, transparent)` }}>
                            <button
                              type="button"
                              onMouseDown={() => selectCity(city)}
                              className="px-[14px] py-3 text-[14px] md:py-[10px] md:text-[13px]"
                              style={{
                                width: "100%",
                                textAlign: "left",
                                color: "var(--text-heading)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontFamily: "inherit",
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = `color-mix(in srgb, ${GOLD} 12%, transparent)`)}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
                            >
                              {city.displayName}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {selectedCity && (
                      <p style={{ fontSize: 11, color: GOLD, marginTop: 4, opacity: 0.8 }}>
                        ✓ {selectedCity.displayName} · {selectedCity.tz}
                      </p>
                    )}
                  </div>
                </div>

                {formError && (
                  <p className="mt-3 text-[12px]" style={{ color: "var(--site-texte-erreur)" }}>{formError}</p>
                )}

                <div className="mt-5 flex flex-col items-stretch gap-3 md:flex-row md:items-center">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isComputing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-center text-[13px] font-semibold transition-transform hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 md:w-auto md:justify-start md:py-3"
                    style={{ background: GOLD, color: "var(--site-texte-sur-aplat)" }}
                  >
                    {isComputing ? (
                      <>
                        <span
                          className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin"
                          style={{ display: "inline-block", flexShrink: 0 }}
                        />
                        {COMPUTE_STEPS[computeStep]}
                      </>
                    ) : (
                      <>Generate my chart <span aria-hidden>→</span></>
                    )}
                  </button>
                  {!isComputing && (
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setFormError(""); }}
                      className="py-2 text-[12px] transition-opacity hover:opacity-60 md:py-0"
                      style={{ color: "var(--text-body-subtle)" }}
                    >
                      Cancel
                    </button>
                  )}
                </div>

                <p className="mt-3 text-[11px]" style={{ color: "var(--text-body-subtle)", opacity: 0.5 }}>
                  Opens a visual preview — real personalized data available with{" "}
                  <Link href="/app/pricing" style={{ color: GOLD }}>a subscription →</Link>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Live chart preview — scaled iframe.
          The iframe is sized as a % of its container and counter-scaled, so it
          stays fluid at any width: on a phone it renders at ~1.5x the (narrow)
          card and shrinks back to fit, same trick as on desktop. */}
      <div
        className="relative mx-4 mb-0 h-[210px] overflow-hidden rounded-t-2xl border-t border-x md:mx-8 md:h-[260px]"
        style={{
          borderColor: `color-mix(in srgb, ${GOLD} 18%, transparent)`,
        }}
      >
        <iframe
          src="/boudin-sausage.html"
          title="Lifetime chart preview"
          aria-hidden="true"
          tabIndex={-1}
          style={{
            width: "150%",
            height: "500px",
            border: "none",
            pointerEvents: "none",
            transform: "scale(0.66)",
            transformOrigin: "top left",
            opacity: 0.9,
          }}
        />
        {/* Fade at bottom */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${GOLD} 7%, var(--bg-primary)))`,
          }}
        />
      </div>

      {/* Full-screen overlay — shows the computed chart inline */}
      {reportHtml && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "var(--site-fond-panneau)",
            display: "flex",
            flexDirection: "column",
            animation: "fadeIn .25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 20px",
              borderBottom: `1px solid color-mix(in srgb, ${GOLD} 18%, transparent)`,
              background: "var(--site-fond-panneau-entete)",
              backdropFilter: "blur(10px)",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: GOLD, letterSpacing: "0.05em" }}>
              Your 100-year timeline
            </span>
            <button
              type="button"
              onClick={() => setReportHtml(null)}
              className="h-11 w-11 shrink-0 md:h-8 md:w-8"
              style={{
                background: `color-mix(in srgb, ${GOLD} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${GOLD} 25%, transparent)`,
                borderRadius: "50%",
                color: GOLD,
                fontSize: 16,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                lineHeight: 1,
              }}
              aria-label="Close chart"
            >
              ×
            </button>
          </div>
          <iframe
            srcDoc={reportHtml}
            title="Your 100-year lifetime timeline"
            style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}

      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
