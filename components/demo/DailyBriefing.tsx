"use client";

/**
 * DailyBriefing — two AI cards at top of timeline.
 *
 * DailyCard   — "Aujourd'hui"  — fast signals (Mars+, L4 ZR, eclipses active today)
 * PeriodCard  — "En ce moment" — slow outer planets, major transits spanning weeks/months
 *
 * Grid: 8px base. All spacing = multiples of 8.
 * Touch: minimum 44px targets (Apple HIG).
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, CloseCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { storage } from "@/lib/storage";
import type { BirthData } from "@/lib/birth-data";
import { S } from "@/lib/layout-constants";

// ─── Types ───────────────────────────────────────────────

interface BriefingData {
  greeting: string;
  summary: string;
  action: string;
  activeDomains: string[];
}

type LoadState = "idle" | "loading" | "ready" | "error";

// ─── Animation ───────────────────────────────────────────

const EASE = [0.4, 0, 0.2, 1] as const;

// ─── Visual tokens ───────────────────────────────────────

const CARD_BG = "var(--glass-bg)";
const CARD_BORDER = "1px solid var(--glass-border)";
const CARD_BLUR = "blur(24px)";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

// ─── Domain colors ───────────────────────────────────────

// Chaque clef de DOMAIN_COLORS pointe vers un jeton. Les valeurs hex restent
// pour memoire de l identite ; ce sont les jetons qui s affichent.
const DOMAIN_SLUGS: Record<string, string> = {
  "carrière": "carriere", travail: "carriere", amour: "amour",
  relations: "amour", couple: "amour", "santé": "sante",
  finances: "argent", argent: "argent", famille: "famille",
  "créativité": "creativite", communication: "communication", foyer: "foyer",
  "spiritualité": "spiritualite", voyage: "voyage", transformation: "transformation",
  "développement personnel": "spiritualite", "opportunités": "argent",
};

const DOMAIN_COLORS: Record<string, string> = {
  carrière: "#7B8CC4", travail: "#7B8CC4", amour: "#BC7A96",
  relations: "#BC7A96", couple: "#BC7A96", santé: "#7BA88A",
  finances: "#B8A472", argent: "#B8A472", famille: "#C48A6A",
  créativité: "#A07FBD", communication: "#6FA3A0", foyer: "#C4727A",
  spiritualité: "#9B85C4", voyage: "#8B80C9", transformation: "#B07AAF",
  "développement personnel": "#9B85C4", opportunités: "#B8A472",
};

/**
 * La couleur d un domaine, en deux valeurs.
 *
 * `base` porte l identite et sert au fond teinte et a la bordure ; `texte` en
 * est derive. La fonction ne renvoyait qu une seule couleur, utilisee pour les
 * TROIS a la fois — donc le libelle etait peint dans la couleur pure sur un
 * fond fait de cette meme couleur a 12 %. Texte et fond partageant la teinte,
 * ils convergeaient : les onze domaines etaient entre 2,02 et 2,78 de contraste
 * en theme clair, pour 4,5 requis. Sur l ecran principal.
 *
 * Les nuances de texte sont calculees dans app/globals.css, une par theme, et
 * verifiees par scripts/verifier-contraste.mjs.
 */
function getDomainColor(domain: string): { base: string; texte: string } {
  const lower = domain.toLowerCase();
  for (const cle of Object.keys(DOMAIN_COLORS)) {
    if (lower.includes(cle)) {
      const slug = DOMAIN_SLUGS[cle];
      if (slug) return { base: `var(--dom-${slug})`, texte: `var(--dom-${slug}-texte)` };
    }
  }
  return { base: "var(--accent-purple)", texte: "var(--text-brand-strong)" };
}

function dateKey(prefix: string): string {
  const d = new Date();
  return `${prefix}_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Hook: data fetching ─────────────────────────────────

function useBriefingData(birthData: BirthData | null, endpoint: string, cachePrefix: string) {
  const [data, setData] = useState<BriefingData | null>(null);
  const [state, setState] = useState<LoadState>("idle");

  useEffect(() => {
    if (!birthData) return;
    let cancelled = false;
    setState("loading");

    async function load() {
      const cacheKey = dateKey(cachePrefix);

      try {
        const cached = await storage.get<BriefingData>(cacheKey, CACHE_TTL_MS);
        if (cached && !cancelled) { setData(cached); setState("ready"); return; }
      } catch { /* miss */ }

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ birthData }),
        });
        if (!res.ok) throw new Error(`API ${res.status}`);
        const result: BriefingData = await res.json();
        if (!cancelled) { setData(result); setState("ready"); await storage.set(cacheKey, result); }
      } catch {
        if (!cancelled) setState("error");
      }
    }

    load();
    return () => { cancelled = true; };
  }, [birthData, endpoint, cachePrefix]);

  return { data, state };
}

// ─── Atom: Domain Pill ───────────────────────────────────

function DomainPill({ domain }: { domain: string }) {
  const { base, texte } = getDomainColor(domain);
  return (
    <span
      className="inline-flex rounded-full font-medium"
      style={{
        fontSize: 10,
        padding: `${S.xs}px ${S.sm + S.xs}px`,
        color: texte,
        background: `color-mix(in srgb, ${base} 12%, transparent)`,
        border: `1px solid color-mix(in srgb, ${base} 18%, transparent)`,
      }}
    >
      {domain}
    </span>
  );
}

// ─── Molecule: Brief Card ────────────────────────────────

function BriefCard({
  briefing,
  eyebrow,
  onDismiss,
}: {
  briefing: BriefingData;
  eyebrow: string;
  onDismiss: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: S.sm }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      // 0,25 s et non 0,6. Cette carte apparait PAR-DESSUS une timeline deja
      // affichee et deja lisible : une entree longue s y lit comme un element
      // qui traverse l ecran, pas comme une arrivee. Six dixiemes de seconde,
      // c est le temps qu il faut pour que l oeil suive le mouvement au lieu de
      // decouvrir le contenu.
      transition={{ duration: 0.25, ease: EASE }}
      className="relative overflow-hidden rounded-2xl"
      style={{
        background: CARD_BG,
        backdropFilter: CARD_BLUR,
        border: CARD_BORDER,
        padding: `${S.md}px ${S.px}px ${S.px}px`,
      }}
    >
      {/* ── Row 1: Eyebrow + Close ── */}
      <div className="flex items-center" style={{ marginBottom: S.md }}>
        <Star style={{ width: 12, height: 12, color: "var(--accent-purple)", opacity: 0.7 }} />
        <span
          className="font-semibold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--accent-purple)",
            opacity: 0.7,
            lineHeight: 1,
            marginLeft: S.sm,
            flex: 1,
          }}
        >
          {eyebrow}
        </span>
        <button
          type="button"
          onClick={onDismiss}
          className="flex items-center justify-center"
          style={{ width: 44, height: 44, marginTop: -S.sm, marginRight: -S.sm }}
          aria-label="Fermer"
        >
          <CloseCircle style={{ width: 18, height: 18, color: "var(--accent-purple)", opacity: 0.35 }} />
        </button>
      </div>

      {/* ── Row 2: Summary ── */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
          color: "var(--text-body)",
          marginBottom: S.md,
          paddingRight: S.sm,
        }}
      >
        {briefing.summary}
      </p>

      {/* ── Row 3: Action ── */}
      <p
        className="font-medium"
        style={{ fontSize: 12, lineHeight: 1.5, color: "var(--accent-purple)", marginBottom: S.md }}
      >
        {briefing.action}
      </p>

      {/* ── Row 4: Domain pills ── */}
      {briefing.activeDomains.length > 0 && (
        <div className="flex flex-wrap items-center" style={{ gap: S.sm }}>
          {briefing.activeDomains.slice(0, 3).map((domain) => (
            <DomainPill key={domain} domain={domain} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ─── Atom: Skeleton ──────────────────────────────────────

/**
 * Plus de squelette. C est LUI, les « deux blocs parasites ».
 *
 * DailyBriefing rend deux cartes, chacune affichait ce rectangle gris pulse de
 * 48 px tant que ses donnees n etaient pas la — et le conteneur les centre
 * au milieu de l ecran, par-dessus la timeline. Deux rectangles flottants, le
 * temps d une lecture IndexedDB.
 *
 * Un squelette a du sens quand il occupe la place de ce qui arrive, dans un
 * flux de contenu : il evite un saut de mise en page. Ici il ne remplace rien —
 * il est superpose a une timeline deja complete et deja lisible. Il n annonce
 * donc pas un chargement, il ajoute du bruit sur un ecran qui n en avait pas
 * besoin.
 *
 * On n affiche rien, et les vraies cartes arrivent en fondu quand elles sont
 * pretes. C est ce que « fluide » veut dire ici : ne rien montrer plutot que
 * montrer un substitut.
 */
function BriefingSkeleton() {
  return null;
}

// ─── Inner: Daily Card (fast signals) ────────────────────

function DailyCard({ birthData }: { birthData: BirthData }) {
  const { data, state } = useBriefingData(birthData, "/api/openai/daily-brief", "daily_brief");
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("unfold_daily_dismissed");
    return stored === new Date().toISOString().slice(0, 10);
  });

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("unfold_daily_dismissed", new Date().toISOString().slice(0, 10));
  }, []);

  if (dismissed || state === "error") return null;
  if (state === "loading" || state === "idle") return <BriefingSkeleton />;
  if (!data) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <BriefCard briefing={data} eyebrow="Aujourd'hui" onDismiss={handleDismiss} />
      )}
    </AnimatePresence>
  );
}

// ─── Inner: Period Card (slow transits) ──────────────────

function PeriodCard({ birthData }: { birthData: BirthData }) {
  const { data, state } = useBriefingData(birthData, "/api/openai/daily-briefing", "daily_briefing");
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("unfold_briefing_dismissed");
    return stored === new Date().toISOString().slice(0, 10);
  });

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem("unfold_briefing_dismissed", new Date().toISOString().slice(0, 10));
  }, []);

  if (dismissed || state === "error") return null;
  if (state === "loading" || state === "idle") return <BriefingSkeleton />;
  if (!data) return null;

  return (
    <AnimatePresence>
      {!dismissed && (
        <BriefCard briefing={data} eyebrow="En ce moment" onDismiss={handleDismiss} />
      )}
    </AnimatePresence>
  );
}

// ─── Organism: Container ─────────────────────────────────

export function DailyBriefing({ onDismiss: onDismissParent }: { onDismiss?: () => void } = {}) {
  const { birthData } = useMomentum();

  if (!birthData) return null;

  // onDismissParent kept for API compat — not used per-card since each dismisses independently
  void onDismissParent;

  return (
    <div style={{ padding: `${S.sm}px ${S.px}px`, display: "flex", flexDirection: "column", gap: S.sm }}>
      <DailyCard birthData={birthData} />
      <PeriodCard birthData={birthData} />
    </div>
  );
}
