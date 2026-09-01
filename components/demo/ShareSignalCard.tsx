"use client";

/**
 * La carte de partage.
 *
 * Sa palette ne suit pas le theme, VOLONTAIREMENT : la carte porte son propre
 * degrade sombre et represente le produit chez quelqu un d autre. Ce qu on
 * partage doit etre identique pour tout le monde.
 *
 * Ce n est pas une raison de l ecrire ici. Elle vivait en dix-neuf valeurs
 * figees dans ce fichier, donc en dehors du seul endroit qui fait autorite sur
 * les couleurs ; le 02/09/2026 elles sont devenues la famille --partage-* de
 * app/globals.css, aux memes chiffres. « Fixe » et « ecrit en dur » sont deux
 * choses differentes : la famille est declaree dans :root et n est PAS
 * redeclaree dans .dark — c est ce qui la rend fixe, exactement comme
 * --echantillon-* et --element-*.
 *
 * En revanche, une palette fixe ne dispense pas d etre lisible. Mesure du
 * 01/09/2026 sur le point le plus clair du degrade, la ou un texte clair
 * contraste le moins :
 *
 *     dates de la periode   0,45  ->  2,77   sous le seuil
 *     « Quel est ton rythme ? »  0,60  ->  3,83   sous le seuil
 *     note de pied          0,50  ->  3,09   sous le seuil
 *
 * Aucun des trois n etait decoratif : le premier porte les DATES de la periode.
 * L opacite minimale qui passe 4,5 sur ce fond est 0,69, d ou le plancher a
 * 0,70 ci-dessous. La hierarchie tient par la taille et la graisse, pas par une
 * transparence qui efface le texte.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShareNodes, ClipboardCheck, Close, Link } from "flowbite-react-icons/outline";
import { planetConfig, houseConfig, getPlanetLabel, type PlanetKey } from "@/lib/domain-config";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";
import { getTierLabel, domainKeyToHouseOrNull } from "@/lib/detail-helpers";
import { jourMoisAnnee } from "@/lib/dates-i18n";

// ─── Types (mirrors CapsuleDetailSheet) ──────────────────
interface CapsuleData {
  id: string;
  phases: {
    id: string;
    domain: string;
    title: string;
    subtitle: string;
    description: string;
    intensity: number;
    score?: number;
    planets: PlanetKey[];
    status: string;
    keyInsight?: string;
    peakMoment?: string;
    guidance?: string;
    color?: string;
    startDate: string;
    endDate?: string;
    durationWeeks: number;
    apiLabel?: string;
    apiCategory?: string;
    transitPlanet?: string;
    natalPoint?: string;
    aspect?: string;
    cycle?: { hitNumber: number; totalHits: number; pattern: string; allHits: { date: string; hitNumber: number }[] };
    apiTopics?: { house: number; color: string; topic: string; source: string }[];
    lotType?: string;
    zrLevel?: number;
    periodSign?: string;
    markers?: string[];
    eclipseType?: string;
    lifetimeNumber?: number;
    lifetimeTotal?: number;
    isVipTransit?: boolean;
  }[];
  domains: { domain: string; intensity: number; occurrence: number; totalOccurrences: number }[];
  planets: PlanetKey[];
  startDate: Date;
  endDate: Date;
  lane: number;
  tier: "toc" | "toctoc" | "toctoctoc";
  tierOccurrence: number;
  tierTotal: number;
  isCurrent: boolean;
  isFuture: boolean;
  color?: string;
}

// Mois abreges : voir lib/dates-i18n.ts. Ceux-ci etaient en francais.

// Chaque carte partagee envoyait vers unfold.app, qui appartient a une autre
// application. Les gens faisaient donc de la publicite pour un tiers en
// partageant leur propre signal.
const SHARE_URL = "https://favorable.day/?utm_source=share&utm_medium=signal";

// ─── Tier glow colors ────────────────────────────────────
function getTierGlow(tier: CapsuleData["tier"]): string {
  if (tier === "toctoctoc") return "var(--partage-halo-fort)";
  if (tier === "toctoc") return "var(--partage-halo-moyen)";
  return "var(--partage-halo-doux)";
}

// ─── Main Component ──────────────────────────────────────
export function ShareSignalCard({
  capsule,
  onClose,
}: {
  capsule: CapsuleData;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const locale = useLocale();
  const phase = capsule.phases[0];
  const tierLabel = getTierLabel(capsule.tier, locale);

  // Une capsule sans domaine ne devient plus une capsule de CARRIERE.
  //
  // C etait `phase?.domain ?? "work"` puis `domainKeyToHouse(...)` : un domaine
  // absent ou inconnu ressortait en maison 10 et la carte prenait sa couleur.
  // Ici l enjeu est une image que la personne PUBLIE — attribuer un domaine au
  // hasard sur quelque chose qui sort de l app est la pire version du defaut.
  //
  // La couleur de repli est un lavande neutre de la palette, pas celle d une
  // maison : elle ne pretend rien.
  const house = domainKeyToHouseOrNull(phase?.domain);
  const houseMeta = house !== null ? houseConfig[house] : undefined;
  const houseColor = capsule.color ?? houseMeta?.color ?? "var(--partage-accent)";

  // Date labels
  const startLabel = jourMoisAnnee(capsule.startDate, locale);
  const endLabel = jourMoisAnnee(capsule.endDate, locale);

  // Display text: AI subtitle first, then phase title
  const displayText = phase?.subtitle || phase?.title || "";

  // Copy handler
  //
  // Declare AVANT handleShare, qui s en sert comme repli. L ordre inverse
  // marchait par accident : la fermeture capturait le `handleCopy` de la
  // portee, mais celui du PREMIER rendu, puisqu il ne figurait pas dans les
  // dependances de handleShare. React 19 le refuse
  // (react-hooks/immutability) — a juste titre : le jour ou handleCopy
  // dependra d une valeur qui change, le repli du partage annulerait avec
  // l ancienne.
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(SHARE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable
    }
  }, []);

  // Share handler
  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Favorable — ${tierLabel}`,
          text: displayText,
          url: SHARE_URL,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2000);
      } catch {
        // User cancelled or API unavailable — fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  }, [tierLabel, displayText, handleCopy]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute inset-0 z-[60] flex items-end justify-center"
        style={{ background: "var(--partage-voile)", backdropFilter: "blur(8px)" }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.96 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 32 }}
          className="w-full max-w-[340px] mx-auto mb-6 flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── The Card ── */}
          <div
            className="relative overflow-hidden"
            style={{
              width: 300,
              height: 533,
              borderRadius: 24,
              // La carte flotte au-dessus du voile : son elevation la porte.
              // Le lisere ET le « 0 0 0 1px » de l ombre etaient deux traits
              // superposes sur le meme bord ; les deux partent, l ombre de
              // profondeur reste.
              background: "var(--partage-carte)",
              boxShadow: "0 24px 64px rgba(10, 6, 20, 0.6)",
            }}
          >
            {/* Ambient glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: 280,
                height: 280,
                background: `radial-gradient(circle, ${getTierGlow(capsule.tier)} 0%, transparent 70%)`,
                pointerEvents: "none",
              }}
            />

            {/* Top: Branding */}
            <div className="relative flex items-center gap-2 px-6 pt-6">
              <div
                className="h-5 w-5 rounded-full"
                style={{
                  background: "var(--partage-pastille-marque)",
                  boxShadow: "0 0 12px rgba(124, 107, 191, 0.4)",
                }}
              />
              <span
                className="text-[11px] font-medium tracking-wide"
                style={{ color: "var(--partage-texte-doux)" }}
              >
                favorable.day
              </span>
            </div>

            {/* Center: Signal content */}
            <div className="relative flex flex-col items-center justify-center px-6" style={{ marginTop: 64 }}>
              {/* Tier badge */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-6"
                style={{
                  // Le badge a un fond opaque teinte de la couleur de maison,
                  // et un halo qui lui appartient depuis toujours. Le lisere
                  // etait la couche de trop.
                  background: `color-mix(in srgb, ${houseColor} 12%, var(--partage-fond-badge))`,
                  boxShadow: `0 0 20px ${getTierGlow(capsule.tier)}`,
                }}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: houseColor,
                    boxShadow: `0 0 8px ${houseColor}`,
                  }}
                />
                <span
                  className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                  style={{ color: houseColor }}
                >
                  {tierLabel}
                </span>
              </div>

              {/* Planet pills */}
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {capsule.planets.slice(0, 3).map((planet) => {
                  const pc = planetConfig[planet];
                  // Le moteur nomme des points qu on ne sait pas representer
                  // (Chiron, l Ascendant, les lots). Sans ce test, pc.color
                  // plantait la carte au lieu de sauter la pastille.
                  const nom = getPlanetLabel(planet, locale);
                  if (!pc || !nom) return null;
                  const isSolarEclipse = planet === "solar-eclipse";
                  return (
                    <div
                      key={planet}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1"
                      style={{
                        // Fond propre a la pastille, teinte de la planete :
                        // il la decoupe deja sur la carte sombre.
                        background: `color-mix(in srgb, ${pc.color} 10%, var(--partage-fond-pastille))`,
                      }}
                    >
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: isSolarEclipse
                            ? "linear-gradient(135deg, #1a1a1a 45%, #C9A86C 55%)"
                            : pc.color,
                          boxShadow: `0 0 6px ${pc.color}`,
                        }}
                      />
                      {/* Le nom dans la langue de la personne. C etait
                          `pc.label`, un libelle francais servi aux dix langues
                          — sur une image DESTINEE A ETRE PARTAGEE. */}
                      <span className="text-[10px] font-medium" style={{ color: pc.color }}>
                        {nom}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Signal text */}
              {displayText && (
                <p
                  className="text-center text-sm leading-relaxed font-medium px-2 mb-5"
                  style={{
                    color: "var(--partage-texte)",
                    maxHeight: 80,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {displayText}
                </p>
              )}

              {/* Date range */}
              <span
                className="text-[10px] tabular-nums tracking-wide"
                style={{ color: "var(--partage-texte-doux)" }}
              >
                {startLabel} — {endLabel}
              </span>
            </div>

            {/* Bottom: CTA */}
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5 pb-6 pt-10"
              style={{
                background: "var(--partage-voile-bas)",
              }}
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: "var(--partage-texte-doux)" }}
              >
                {perso("partage.rythme", locale)}
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--partage-accent)" }}
              >
                favorable.day
              </span>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex gap-3 w-full max-w-[300px]">
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all duration-200"
              style={{
                // Contour retire, densite du fond montee de 0,15 a 0,20 :
                // c est la surface qui reprend le poids que le trait portait.
                // Meme teinte, aucune couleur nouvelle. Sur le voile sombre a
                // 0,75, un bouton laisse a 0,15 sans contour se serait efface.
                background: "var(--partage-bouton)",
                color: "var(--partage-texte-bouton)",
              }}
            >
              <ShareNodes size={16} />
              <span className="text-[12px] font-medium">
                {shared ? perso("partage.en_cours", locale) : perso("partage.partager", locale)}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 transition-all duration-200"
              style={{
                // Bouton secondaire : il monte de 0,08 a 0,14, soit un cran
                // sous le bouton principal a 0,20. La hierarchie entre les
                // deux est desormais portee par la densite des fonds seule.
                background: copied
                  ? "var(--partage-bouton-copie)"
                  : "var(--partage-bouton-doux)",
                color: copied ? "var(--partage-accent)" : "var(--partage-texte-doux)",
              }}
            >
              {copied ? <ClipboardCheck size={16} /> : <Link size={16} />}
              <span className="text-[12px] font-medium">
                {copied ? perso("partage.copie", locale) : perso("partage.copier", locale)}
              </span>
            </button>
          </div>

          {/* ── Close button ── */}
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center h-11 w-11 rounded-full transition-colors duration-200"
            style={{
              // Meme montee que le bouton secondaire : 0,08 -> 0,14. Une cible
              // de 44 points posee sur un voile a 0,75 doit se voir sans trait.
              background: "var(--partage-bouton-doux)",
              color: "var(--partage-texte-doux)",
            }}
          >
            <Close size={18} />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
