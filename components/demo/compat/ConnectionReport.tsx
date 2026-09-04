"use client";

import { usePremiumTeaser } from "@/components/demo/PremiumTeaserContext";
import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useTheme } from "next-themes";
import { PlanetPill, TierBadge, EyebrowLabel } from "@/components/demo/primitives";
import { fetchConnectionBrief, type ActivePeriod } from "@/lib/connection-brief-api";
import {
  getConnectionDelineation,
  estMurPayant,
  estSilence,
  type ConnectionDelineation,
  type PersonDelineation,
  type SilenceDelineation,
} from "@/lib/connection-delineation";
import type { MatchingWindow, RelationshipType } from "@/lib/matching-narratives";
import type { RealConnection } from "@/lib/connections-store";
import type { BirthData } from "@/lib/birth-data";
import { relationshipConfig } from "./relationshipConfig";
import { texteLisible } from "@/lib/contraste";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

interface ConnectionReportProps {
  connection: RealConnection;
  myBirthData: BirthData | null;
  /** When true, suppress the scroll container wrapper so a parent pager can manage scroll. */
  embedded?: boolean;
}

/**
 * The scrolling body of a connection detail — one stack of WindowCards.
 * Extracted from app/demo/compatibility/[connectionId]/page.tsx so it can be
 * rendered standalone OR inside ConnectionCarousel for swipeable detail.
 */
export function ConnectionReport({ connection, myBirthData, embedded }: ConnectionReportProps) {
  const locale = detectLocale();
  const [windows, setWindows] = useState<MatchingWindow[]>([]);
  const [periods, setPeriods] = useState<ActivePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      if (myBirthData && connection.birthData) {
        try {
          const result = await fetchConnectionBrief(
            myBirthData,
            connection.birthData,
            connection.relationship as RelationshipType,
            connection.name,
          );
          if (!cancelled && result.windows.length > 0) {
            setWindows(result.windows);
            setPeriods(result.periods);
            setHasData(true);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("[ConnectionReport] brief error:", err);
        }
      }
      if (!cancelled) {
        setWindows([]);
        setPeriods([]);
        setHasData(false);
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [connection.id, connection.birthData, connection.name, connection.relationship, myBirthData]);

  const rel = relationshipConfig[connection.relationship];

  const body = (() => {
    if (loading) {
      return (
        <div className="flex flex-1 items-center justify-center py-20">
          <motion.div
            className="h-5 w-5 rounded-full border-2 border-transparent"
            style={{
              borderTopColor: "var(--accent-purple)",
              borderRightColor: "var(--accent-purple)",
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
      );
    }
    if (!hasData) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center">
          <p className="text-sm text-text-body">
            {connection.birthData
              ? "Pas assez de données pour comparer vos rythmes."
              : `${connection.name} n'a pas encore partagé ses données de naissance.`}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {windows.map((w, i) => (
          <WindowCard
            key={w.monthKey}
            w={w}
            period={periods[i]}
            i={i}
            relColor={rel.color}
            theirName={connection.name}
            myBirthData={myBirthData}
            theirBirthData={connection.birthData}
          />
        ))}
        <div className="h-4" />
      </div>
    );
  })();

  if (embedded) return body;
  return <div className="flex min-h-0 flex-col">{body}</div>;
}

// ─── WindowCard (unchanged from previous detail page) ────

function WindowCard({
  w,
  period,
  i,
  relColor,
  theirName,
  myBirthData,
  theirBirthData,
}: {
  w: MatchingWindow;
  period: ActivePeriod;
  i: number;
  relColor: string;
  theirName: string;
  myBirthData: BirthData | null;
  theirBirthData: BirthData;
}) {
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  // w.tierColor et relColor sortent du moteur : ils ne sont pas connus a
  // l avance, donc aucun jeton ne peut les couvrir. Les couleurs de palier
  // valent 2,02 a 3,19 sur le fond clair — elles ont ete choisies pour le
  // theme sombre, ou elles passent. On derive au rendu (regle 3).
  const theme = resolvedTheme === "light" ? "clair" : "sombre";
  const [del, setDel] = useState<ConnectionDelineation | SilenceDelineation | null>(null);
  const openPremium = usePremiumTeaser();
  const [delLoading, setDelLoading] = useState(true);

  useEffect(() => {
    if (!myBirthData) return;
    getConnectionDelineation(
      period,
      w.relationship,
      {
        birthDate: myBirthData.birthDate,
        birthTime: myBirthData.birthTime,
        latitude: myBirthData.latitude,
        longitude: myBirthData.longitude,
      },
      {
        birthDate: theirBirthData.birthDate,
        birthTime: theirBirthData.birthTime,
        latitude: theirBirthData.latitude,
        longitude: theirBirthData.longitude,
      },
    )
      .then((r) => {
        // 402 : le serveur demande le plan. On ouvre le mur au lieu de servir
        // en silence le texte brut du moteur. Le texte de repli reste affiche
        // derriere, pour qu un refus du mur ne laisse pas un ecran vide.
        if (estMurPayant(r)) { openPremium(); setDel(null); return; }
        setDel(r);
      })
      .finally(() => setDelLoading(false));
  }, [period, w.relationship, myBirthData, theirBirthData, openPremium]);

  const isActive = w.status === "active";
  const silencieux = estSilence(del);
  const lecture = del && !silencieux ? del : null;

  return (
    <motion.div
      className="rounded-2xl overflow-hidden"
      style={{
        // La carte tenait sur --surface-subtle (4 % de violet translucide) et
        // sur un lisere a la couleur du palier. Le trait retire, c est le fond
        // qui porte les deux roles : --fond-cellule le pose franchement sur la
        // page, et la teinte du palier — 10 % si actif, 4 % sinon — dit l etat
        // la ou le lisere le disait. Meme couleur, autre support.
        background: `color-mix(in srgb, ${w.tierColor} ${isActive ? "10" : "4"}%, var(--fond-cellule))`,
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + i * 0.05 }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: isActive ? w.tierColor : "var(--text-body-subtle)",
              opacity: isActive ? 1 : 0.4,
            }}
          />
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{
              color: isActive
                ? texteLisible(w.tierColor, theme, 0)
                : "var(--text-body-subtle)",
            }}
          >
            {isActive ? perso("compat.actif", locale) : w.status === "past" ? "Passé" : "À venir"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TierBadge tier={w.tier} color={w.tierColor} />
          <span className="text-[10px] text-text-body-subtle">
            {isActive ? `${w.daysLeft}j restants` : w.status === "past" ? "" : `dans ${w.daysLeft}j`}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4">
        <h3 className="text-base font-bold text-text-heading mt-1">
          {lecture ? lecture.ensemble.titre : silencieux ? "Rien de marquant" : w.title}
        </h3>
        <p className="text-[11px] text-text-body-subtle mt-0.5">{w.dateRange}</p>

        {silencieux ? (
          <div
            className="mt-3 rounded-xl px-3.5 py-2.5"
            style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
          >
            <p className="text-xs text-text-body leading-relaxed">
              Pas de signal partagé assez solide ce mois-ci pour une lecture à deux.
              On se tait plutôt que d&apos;inventer.
            </p>
          </div>
        ) : (
          <>
        <div
          className="mt-3 rounded-xl px-3.5 py-2.5"
          style={{ background: `color-mix(in srgb, ${w.tierColor} 8%, transparent)` }}
        >
          {delLoading ? (
            <div
              className="h-3 rounded animate-pulse w-3/4"
              style={{ background: `color-mix(in srgb, ${w.tierColor} 20%, transparent)` }}
            />
          ) : (
            <p className="text-xs font-semibold text-text-heading">
              {lecture ? lecture.ensemble.annees : w.sharedTheme}
            </p>
          )}
        </div>

        {lecture?.ensemble.eclipses && (
          <TechniqueLine label="Éclipses" text={lecture.ensemble.eclipses} />
        )}
        {lecture?.ensemble.passages && (
          <TechniqueLine label="Ce mois" text={lecture.ensemble.passages} />
        )}

        <div className="mt-3 space-y-2">
          <PersonTechniqueCard
            eyebrow="Vous"
            eyebrowColor="var(--accent-purple)"
            titre={lecture?.personA.titre}
            person={lecture?.personA}
            fallback={w.you.description}
            loading={delLoading}
            planet={w.you.planet}
          />
          <PersonTechniqueCard
            eyebrow={theirName}
            eyebrowColor={texteLisible(relColor, theme, 0)}
            titre={lecture?.personB.titre}
            person={lecture?.personB}
            fallback={w.them.description}
            loading={delLoading}
            planet={w.them.planet}
            titreColor={texteLisible(relColor, theme, 0)}
          />
        </div>

        {lecture?.ensemble.empathie && (
          <div className="mt-2 rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-text-body-subtle">
              Se comprendre
            </p>
            <p className="text-xs text-text-body leading-relaxed">{lecture.ensemble.empathie}</p>
          </div>
        )}

        <div
          className="mt-2 rounded-xl px-3.5 py-2.5"
          style={{
            background: `color-mix(in srgb, ${w.tierColor} 10%, transparent)`,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: w.tierColor }}>
            {perso("compat.ensemble", locale)}
          </p>
          {delLoading ? (
            <div className="space-y-1">
              <div className="h-2.5 rounded animate-pulse w-full" style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
              <div className="h-2.5 rounded animate-pulse w-3/5" style={{ background: `color-mix(in srgb, ${w.tierColor} 15%, transparent)` }} />
            </div>
          ) : (
            <p className="text-xs text-text-heading font-medium leading-relaxed">
              {lecture ? lecture.ensemble.aFaireEnsemble : w.action}
            </p>
          )}
        </div>
          </>
        )}
      </div>
    </motion.div>
  );
}

function TechniqueLine({ label, text }: { label: string; text: string }) {
  return (
    <p className="mt-2 text-[11px] text-text-body-subtle leading-relaxed">
      <span className="font-semibold text-text-body">{label} · </span>
      {text}
    </p>
  );
}

function PersonTechniqueCard({
  eyebrow,
  eyebrowColor,
  titre,
  person,
  fallback,
  loading,
  planet,
  titreColor,
}: {
  eyebrow: string;
  eyebrowColor: string;
  titre?: string;
  person?: PersonDelineation;
  fallback: string;
  loading: boolean;
  planet: MatchingWindow["you"]["planet"];
  titreColor?: string;
}) {
  return (
    <div className="rounded-xl px-3.5 py-2.5" style={{ background: "var(--surface-light)" }}>
      <div className="flex items-start justify-between gap-2">
        <EyebrowLabel color={eyebrowColor} className="mb-1">
          {eyebrow}
        </EyebrowLabel>
        {titre && (
          <span
            className="text-[9px] font-semibold uppercase tracking-widest shrink-0"
            style={{ color: titreColor ?? eyebrowColor, opacity: titreColor ? 1 : 0.5 }}
          >
            {titre}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-1">
          <div className="h-2.5 rounded animate-pulse w-full" style={{ background: "var(--surface-medium)" }} />
          <div className="h-2.5 rounded animate-pulse w-4/5" style={{ background: "var(--surface-medium)" }} />
        </div>
      ) : person ? (
        <div className="space-y-2">
          <TechniqueBlock label="Cette année" text={person.annee} />
          {person.eclipse && <TechniqueBlock label="Éclipse" text={person.eclipse} />}
          {person.passage && <TechniqueBlock label="Ce mois" text={person.passage} />}
          {person.fond && <TechniqueBlock label="Chapitre" text={person.fond} />}
          <p className="text-[10px] text-text-body-subtle italic leading-snug">{person.defi}</p>
        </div>
      ) : (
        <p className="text-xs text-text-body leading-relaxed">{fallback}</p>
      )}
      {planet && <PlanetPill planet={planet} className="mt-1.5" />}
    </div>
  );
}

function TechniqueBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold uppercase tracking-wider text-text-body-subtle mb-0.5">
        {label}
      </p>
      <p className="text-xs text-text-body leading-relaxed">{text}</p>
    </div>
  );
}
