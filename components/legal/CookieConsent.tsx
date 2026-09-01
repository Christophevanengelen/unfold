"use client";

import { useSyncExternalStore } from "react";

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

/**
 * Le consentement vit dans localStorage, donc HORS de React.
 *
 * Il etait lu par useState("accepted") + useEffect : le bandeau etait donc
 * ABSENT a la premiere image et apparaissait a la suivante, en poussant le bas
 * de la page. Un saut de mise en page sur chaque premiere visite, et React 19
 * le signale (« cascading renders »).
 *
 * useSyncExternalStore est le motif du depot pour ce cas — voir
 * lib/use-locale.ts. Le magasin sert aussi a ce que deux bandeaux montes en
 * meme temps, ou un second onglet, ne se contredisent pas.
 */
const EVENEMENT = "unfold:cookie-consent-changed";

/** Memoise : useSyncExternalStore compare le resultat par identite. */
let cache: ConsentState | null = null;

function lire(): ConsentState {
  if (cache !== null) return cache;
  try {
    const stocke = localStorage.getItem(COOKIE_CONSENT_KEY);
    cache = stocke === "declined" ? "declined" : stocke ? "accepted" : "pending";
  } catch {
    // Stockage refuse : on ne montre RIEN. Montrer un bandeau dont la reponse
    // ne pourra pas etre retenue, c est le reposer a chaque chargement.
    cache = "accepted";
  }
  return cache;
}

function lireServeur(): ConsentState {
  // Le serveur ne sait pas ce que la personne a repondu. On rend l etat cache,
  // et le client montre le bandeau des la premiere image s il le faut.
  return "accepted";
}

function abonner(prevenir: () => void): () => void {
  window.addEventListener(EVENEMENT, prevenir);
  // Un autre onglet a pu repondre.
  const surStockage = () => { cache = null; prevenir(); };
  window.addEventListener("storage", surStockage);
  return () => {
    window.removeEventListener(EVENEMENT, prevenir);
    window.removeEventListener("storage", surStockage);
  };
}

function repondre(reponse: Exclude<ConsentState, "pending">): void {
  try {
    localStorage.setItem(COOKIE_CONSENT_KEY, reponse);
  } catch {
    // Voir lire() : sans stockage la question reviendra, on ne peut pas mieux.
  }
  cache = reponse;
  window.dispatchEvent(new CustomEvent(EVENEMENT));
}

export function CookieConsent({ locale = "en" }: { locale?: string }) {
  const consent = useSyncExternalStore(abonner, lire, lireServeur);

  function handleAccept() {
    repondre("accepted");
  }

  function handleDecline() {
    repondre("declined");
  }

  if (consent !== "pending") return null;

  const l = labels[locale] ?? labels.en;

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-50 p-4 md:p-6"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-white/10 bg-[var(--bg-primary)] p-5 shadow-2xl backdrop-blur-xl sm:flex-row sm:items-center sm:gap-6">
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
            style={{ backgroundColor: "var(--accent-purple)" }}
          >
            {l.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
