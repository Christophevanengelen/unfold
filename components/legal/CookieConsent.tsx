"use client";

import { useState, useEffect } from "react";

const COOKIE_CONSENT_KEY = "unfold-cookie-consent";

type ConsentState = "pending" | "accepted" | "declined";

const labels: Record<string, { message: string; accept: string; decline: string; manage: string }> = {
  en: {
    message: "We use essential cookies to make the site work. With your consent, we may also use analytics cookies to improve your experience.",
    accept: "Accept all",
    decline: "Essential only",
    manage: "Cookie settings",
  },
  fr: {
    message: "Nous utilisons des cookies essentiels au fonctionnement du site. Avec votre consentement, nous pouvons aussi utiliser des cookies analytiques pour am\u00e9liorer votre exp\u00e9rience.",
    accept: "Tout accepter",
    decline: "Essentiels uniquement",
    manage: "Param\u00e8tres cookies",
  },
  es: {
    message: "Usamos cookies esenciales para que el sitio funcione. Con tu consentimiento, tambi\u00e9n podemos usar cookies anal\u00edticas para mejorar tu experiencia.",
    accept: "Aceptar todo",
    decline: "Solo esenciales",
    manage: "Configuraci\u00f3n de cookies",
  },
};

export function CookieConsent({ locale = "en" }: { locale?: string }) {
  const [consent, setConsent] = useState<ConsentState>("accepted"); // default to hidden

  useEffect(() => {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) {
      setConsent("pending");
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setConsent("accepted");
  }

  function handleDecline() {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    setConsent("declined");
  }

  if (consent !== "pending") return null;

  const l = labels[locale] ?? labels.en;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-white/10 bg-[var(--bg-primary,#1B1535)] p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6">
        <p className="flex-1 text-sm leading-relaxed text-brand-11">
          {l.message}
        </p>
        <div className="flex shrink-0 gap-3">
          <button
            onClick={handleDecline}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-brand-10 transition-colors hover:border-white/20 hover:text-white"
          >
            {l.decline}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-lg bg-accent-purple px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: "var(--accent-purple, #7C6BBF)" }}
          >
            {l.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
