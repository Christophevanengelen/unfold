"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CTA_IMMEDIAT, CTA_DEPART, CTA_ARRIVEE } from "@/lib/onboarding-motion";
import { t } from "@/lib/i18n-demo";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";

interface StepSignalPreviewProps {
  onNext: () => void;
  onBack: () => void;
}

/**
 * Step 2 — Life scroll.
 *
 * The strip scrolls upward from birth to now. A fixed NOW line sits
 * at the center. Each boudin highlights as it passes the line, then
 * fades back. The last one (current) stays lit.
 *
 * Frise DESSINEE, et rien d autre : cet ecran arrive avant qu on ait demande
 * la date de naissance, donc il n a aucune donnee sur la personne. Il porte la
 * mention « Exemple ». Ne pas y remettre d annee : les treize capsules
 * portaient chacune la sienne, de 1985 a 2036, et un compteur affichait une
 * annee de naissance inventee. Elles ne servaient plus a rien et n attendaient
 * qu un rebranchement pour redevenir la vie de quelqu un d autre.
 */

// y=0 = NOW. Positive y = PAST (below NOW). Negative y = FUTURE (above NOW).
// Matches the timeline: past goes down, future goes up.
const BOUDINS = [
  // Future (above NOW)
  { y: -200, w: 24, h: 36,  color: "#C4A86B", opacity: 0.2,  dots: 2 },
  { y: -150, w: 16, h: 20,  color: "#50C4D6", opacity: 0.25, dots: 1 },
  { y: -100, w: 26, h: 40,  color: "#6BA89A", opacity: 0.35, dots: 3 },
  // NOW
  { y: -35,  w: 38, h: 64,  color: "#B07CC2", opacity: 1,    dots: 4, isCurrent: true },
  // Past (below NOW) — each boudin spaced so none overlap (min 16px gap)
  { y: 90,   w: 28, h: 44,  color: "#6BA89A", opacity: 0.7,  dots: 3 },  // bottom: 134
  { y: 150,  w: 24, h: 36,  color: "#D89EA0", opacity: 0.6,  dots: 2 },  // bottom: 186
  { y: 202,  w: 30, h: 50,  color: "#9585CC", opacity: 0.6,  dots: 3 },  // bottom: 252
  { y: 268,  w: 20, h: 30,  color: "#6BA89A", opacity: 0.5,  dots: 2 },  // bottom: 298
  { y: 314,  w: 26, h: 44,  color: "#B07CC2", opacity: 0.5,  dots: 2 },  // bottom: 358
  { y: 374,  w: 22, h: 36,  color: "#C4A86B", opacity: 0.5,  dots: 2 },  // bottom: 410
  { y: 426,  w: 16, h: 22,  color: "#9585CC", opacity: 0.4,  dots: 1 },  // bottom: 448
  { y: 464,  w: 18, h: 28,  color: "#6BA89A", opacity: 0.4,  dots: 1 },  // bottom: 492
  { y: 508,  w: 14, h: 20,  color: "#8B7FC2", opacity: 0.4,  dots: 1 },  // bottom: 528
];

const SCROLL_DISTANCE = 580;
const SCROLL_DURATION = 3.2;
const SCROLL_EASE: [number, number, number, number] = [0.12, 0.8, 0.15, 1];

// Calculate when each boudin crosses center (0) during the scroll
// Scroll goes from y=SCROLL_DISTANCE to y=0 over SCROLL_DURATION
// A boudin at position `by` crosses center when scrollOffset + by = 0
// → scrollOffset = -by → progress = (SCROLL_DISTANCE - (-by)) / SCROLL_DISTANCE
// Boudin crosses NOW when strip offset makes boudinY align with center
// Strip goes from y=-580 to y=-30. A boudin at y crosses NOW when: -offset + y ≈ 0
// → offset ≈ y → progress ≈ (SCROLL_DISTANCE - (SCROLL_DISTANCE - 30 - y)) / SCROLL_DISTANCE
function getCrossTime(boudinY: number): number {
  const endY = 30; // strip ends at y=-30
  const totalTravel = SCROLL_DISTANCE - endY; // 550
  const progress = (boudinY + SCROLL_DISTANCE) / (totalTravel + SCROLL_DISTANCE);
  // Apply approximate ease timing (linear approximation of the cubic-bezier)
  return Math.max(0, Math.min(1, progress)) * SCROLL_DURATION;
}

/**
 * Staged reveal phases — each element gets its "moment"
 * 0: scroll playing (0-3.5s)
 * 1: NOW line spotlight (3.5s)
 * 2: current boudin spotlight + annotation (5s)
 * 3: CTA visible (6.5s)
 */
const PHASE_NOW_HIGHLIGHT = SCROLL_DURATION + 0.5;   // 3.7s
const PHASE_BOUDIN_SPOTLIGHT = PHASE_NOW_HIGHLIGHT + 1.5; // 5.2s
const PHASE_CTA_REVEAL = PHASE_BOUDIN_SPOTLIGHT + 1.5;    // 6.7s

export function StepSignalPreview({ onNext, onBack }: StepSignalPreviewProps) {
  // La langue passe par useLocale : elle est lue HORS de React, donc par
  // useSyncExternalStore. Le useState + useEffect d avant rendait cet ecran une
  // premiere fois EN ANGLAIS puis se corrigeait — un scintillement de langue
  // sur le premier ecran que la personne voit du produit.
  const locale = useLocale();
  // Staged highlight phases
  const [phase, setPhase] = useState(0);

  // Phase timers — sequential spotlight
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), PHASE_NOW_HIGHLIGHT * 1000);
    const t2 = setTimeout(() => setPhase(2), PHASE_BOUDIN_SPOTLIGHT * 1000);
    const t3 = setTimeout(() => setPhase(3), PHASE_CTA_REVEAL * 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.div className="flex h-full flex-col">

      <motion.button
        type="button"
        onClick={onBack}
        // Zone de touche etendue plutot que bouton agrandi : le libelle fait
        // 16 points, Apple en demande 44, et l agrandir decalerait tout ce qui
        // suit — l animation de l ecran est calee sur ces positions.
        className="relative self-start text-xs font-medium before:absolute before:-inset-3.5 before:content-['']"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("onboarding.back", locale)}
      </motion.button>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}>
          {t("onboarding.p2_headline", locale)}
        </h1>
      </motion.div>

      {/* Life strip area — fade edges so no boudin gets cut */}
      <div className="relative mt-4 flex-1 overflow-hidden"
        style={{ maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 88%, transparent 100%)" }}>

        {/* Fixed NOW line — below the current boudin with breathing room */}
        <motion.div
          className="absolute left-0 right-0 flex items-center gap-2 z-20"
          style={{ top: "calc(46% + 16px)", transform: "translateY(-50%)" }}
          animate={phase >= 1 ? {
            opacity: [0.6, 1, 0.6],
          } : { opacity: 1 }}
          transition={phase >= 1 ? {
            duration: 2,
            repeat: phase === 1 ? Infinity : 0,
            ease: "easeInOut",
          } : {}}
        >
          <motion.div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent-purple) 30%, transparent))" }}
            animate={phase >= 1 ? {
              background: "linear-gradient(to right, transparent, color-mix(in srgb, var(--accent-purple) 65%, transparent))",
            } : {}}
            transition={{ duration: 0.6 }}
          />
          <motion.span
            className="text-[9px] font-bold uppercase tracking-[0.2em] px-2"
            // « white » etait ecrit en dur : invisible sur fond clair. Le
            // repere NOW se pose sur le fond de la page, pas sur une surface
            // coloree — il lui faut donc la couleur de titre du theme.
            style={{ color: "var(--text-heading)" }}
            animate={phase >= 1 ? { opacity: 1, scale: 1.15 } : { opacity: 0.6, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            now
          </motion.span>
          <motion.div
            className="flex-1 h-px"
            style={{ background: "linear-gradient(to left, transparent, color-mix(in srgb, var(--accent-purple) 30%, transparent))" }}
            animate={phase >= 1 ? {
              background: "linear-gradient(to left, transparent, color-mix(in srgb, var(--accent-purple) 65%, transparent))",
            } : {}}
            transition={{ duration: 0.6 }}
          />
        </motion.div>

        {/* Halo ring removed — moved inside boudin render */}


        {/* Scrolling strip */}
        <motion.div
          className="absolute left-0 right-0"
          style={{ top: "46%" }}
          initial={{ y: -SCROLL_DISTANCE }}
          animate={{ y: -44 }}
          transition={{ duration: SCROLL_DURATION, ease: SCROLL_EASE }}
        >
          {BOUDINS.map((s, i) => {
            const left = `calc(50% - ${s.w / 2}px + ${(i % 2 === 0 ? -1 : 1) * 10}px)`;
            const crossTime = getCrossTime(s.y);
            const isLast = s.isCurrent;
            const isPast = s.y > 0; // positive y = below NOW = past

            return (
              <motion.div
                key={i}
                className="absolute"
                style={{ top: s.y, left, width: s.w, height: s.h, overflow: "visible" }}
                // Phase 2+: current boudin gets a dramatic spotlight
                animate={
                  isLast
                    ? {
                        scale: phase >= 2 ? 1.35 : [1, 1, 1.2],
                        opacity: 1,
                      }
                    : {
                        scale: 1,
                        opacity: phase >= 2 ? (isPast ? 0.25 : 0.4) : (isPast ? 0.5 : 1),
                      }
                }
                transition={
                  isLast
                    ? phase >= 2
                      ? { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
                      : { duration: SCROLL_DURATION + 0.5, delay: 0, times: [0, 0.85, 1], ease: "easeOut" }
                    : { duration: 0.5, ease: "easeOut" }
                }
              >
                <motion.div
                  className="h-full w-full"
                  style={{
                    borderRadius: Math.min(s.w, s.h) / 2,
                    background: s.isCurrent
                      ? `linear-gradient(135deg, ${s.color}, color-mix(in srgb, ${s.color} 60%, transparent))`
                      : `linear-gradient(135deg, color-mix(in srgb, ${s.color} 50%, transparent), color-mix(in srgb, ${s.color} 20%, transparent))`,
                    // Les barres sont des aplats degrades pleins — de 100 % a
                    // 20 % de leur couleur. Elles n ont jamais eu besoin d etre
                    // cernees pour se voir.
                  }}
                  animate={{
                    boxShadow: isLast
                      ? phase >= 2
                        ? `0 0 32px ${s.color}80, 0 0 64px ${s.color}40`
                        : [`0 0 0px transparent`, `0 0 0px transparent`, `0 0 24px color-mix(in srgb, ${s.color} 40%, transparent)`]
                      : `0 0 0px transparent`,
                  }}
                  transition={{
                    duration: isLast ? (phase >= 2 ? 0.8 : SCROLL_DURATION + 0.5) : 0.3,
                    delay: isLast && phase < 2 ? 0 : 0.2,
                    times: isLast && phase < 2 ? [0, 0.85, 1] : undefined,
                  }}
                />
                {s.dots > 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-[3px]">
                    {Array.from({ length: s.dots }).map((_, j) => (
                      <div key={j} className="rounded-full"
                        style={{
                          width: s.isCurrent ? 5 : 4,
                          height: s.isCurrent ? 5 : 4,
                          backgroundColor: "white",
                          opacity: s.isCurrent ? 0.8 : 0.5,
                        }}
                      />
                    ))}
                  </div>
                )}
                {/* Halo pulse — around current boudin, overflow visible */}
                {isLast && phase >= 1 && phase < 3 && (
                  <motion.div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: "50%",
                      left: "50%",
                      width: s.w + 30,
                      height: s.h + 30,
                      x: "-50%",
                      y: "-50%",
                      border: `1.5px solid ${s.color}`,
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: [0, 0.5, 0], scale: [0.9, 1.4, 1.8] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* Annotation overlay — fixed position outside strip, not clipped */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              className="absolute z-30 left-0 right-0 flex justify-center"
              style={{ top: "calc(46% + 42px)" }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                style={{
                  // Trois valeurs figees, pensees pour le sombre : un lilas
                  // pale sur un mauve pale devenait illisible en clair. Les
                  // trois derivent maintenant du theme.
                  color: "var(--text-heading)",
                  // Fond opaque a 20 % de violet sur le fond de page : la
                  // pastille est deja decoupee. Le lisere a 45 % la durcissait.
                  background: "color-mix(in srgb, var(--accent-purple) 20%, var(--bg-primary))",
                  backdropFilter: "blur(8px)",
                }}>
                {/* « Exemple », et non « Ton signal est actif ».
                    
                    Cette frise est DESSINEE — treize periodes ecrites en dur,
                    de 1985 a 2036 — et l ecran arrive AVANT qu on ait demande
                    la date de naissance. Affirmer que c est le signal de la
                    personne etait donc faux, au moment precis ou elle decide de
                    nous faire confiance. */}
                {perso("demo.exemple", locale)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Halo removed — will be rendered inside boudin with overflow visible */}
      </div>

      {/* CTA — always in layout, fades in smoothly */}
      <motion.div
        className="mt-auto pt-6"
        initial={CTA_DEPART}
        animate={CTA_ARRIVEE}
        transition={CTA_IMMEDIAT}
      >
        <button
          type="button"
          onClick={onNext}
          // rounded-full et non rounded-[20px] : le bouton principal du parcours
          // est arrondi complet sur trois des cinq ecrans. Deux rayons differents
          // pour le meme bouton, d un ecran au suivant, se lit comme un defaut de
          // fabrication meme quand on ne sait pas nommer ce qu on voit.
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          {t("onboarding.p2_cta", locale)}
        </button>
      </motion.div>
    </motion.div>
  );
}
