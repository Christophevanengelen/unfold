"use client";

import { motion } from "motion/react";
import { CTA_IMMEDIAT, CTA_DEPART, CTA_ARRIVEE } from "@/lib/onboarding-motion";
import { fadeInUp, staggerContainer } from "@/lib/animations";
import { CalendarMonth, Clock, ChartPie } from "flowbite-react-icons/outline";
import { useMemo } from "react";
import { useMomentum } from "@/lib/momentum-store";
import { detectLocale } from "@/lib/i18n-demo";
import { previsionSemaine } from "@/lib/prevision-semaine";

interface StepPremiumProps {
  onNext: () => void;
  onBack: () => void;
}

const features = [
  { Icon: CalendarMonth, text: "Future peaks & windows" },
  { Icon: Clock, text: "Timing alerts" },
  { Icon: ChartPie, text: "Monthly momentum map" },
];

/**
 * Les sept prochains jours, calcules depuis les VRAIES phases.
 *
 * Cet ecran affichait mockForecast — lundi 78, mardi 82, mercredi 91 avec un
 * pic — les memes chiffres pour tout le monde, et le commentaire d origine
 * disait sans ironie « uses real mockForecast data for credibility ».
 *
 * C est l ecran de VENTE. Montrer de faux pics pour convaincre quelqu un de
 * payer n est pas une approximation d interface : c est une preuve fabriquee,
 * presentee au moment precis ou la personne decide de faire confiance. C est la
 * raison pour laquelle cet ecran ne pouvait pas etre remis dans le parcours en
 * l etat, quoi qu on veuille par ailleurs.
 *
 * Les jours sont nommes par Intl, donc dans la langue de la personne, et ils
 * correspondent aux VRAIES dates a venir — la liste figee « Mon, Tue… » ne
 * s alignait meme pas sur le jour ou l on se trouvait.
 */
function ForecastTimeline() {
  const { phases, state } = useMomentum();
  const locale = detectLocale();
  const prevision = useMemo(() => {
    const debut = new Date();
    debut.setHours(0, 0, 0, 0);
    return previsionSemaine(phases ?? [], debut);
  }, [phases]);
  const nomJour = useMemo(
    () => new Intl.DateTimeFormat(locale, { weekday: "short" }),
    [locale],
  );

  // Sans phases, previsionSemaine retombe sur une semaine plate a 62 : sept
  // points identiques, sans pic. Ce n est pas une donnee fabriquee, mais sur
  // l ecran de VENTE ca se lit comme la semaine de la personne alors que rien
  // n a ete calcule pour elle. La regle du produit vaut ici plus qu ailleurs :
  // sans valeur calculee, on n affiche pas le champ.
  if (phases.length === 0 || state !== "ready") return null;

  return (
    <div className="flex items-end justify-between px-2">
      {prevision.map((day, i) => {
        // Map momentum (60-100) to dot size (6-16px)
        const dotSize = 6 + ((Math.max(60, day.momentum) - 60) / 40) * 10;

        return (
          <motion.div
            key={i}
            className="flex flex-col items-center gap-2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.4 + i * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            {/* Momentum dot */}
            <div className="relative flex items-center justify-center">
              {/* Glow ring for peak days */}
              {day.estPic && (
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    width: dotSize + 10,
                    height: dotSize + 10,
                    background:
                      "color-mix(in srgb, var(--accent-purple) 20%, transparent)",
                  }}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              )}
              <div
                className="rounded-full"
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: day.estPic
                    ? "var(--accent-purple)"
                    : "var(--brand-6)",
                }}
              />
            </div>

            {/* Day label */}
            <span
              className="text-[9px] font-medium"
              // --text-brand et non --accent-purple a 50 % d opacite : dilue de
              // moitie sur le fond de page, le libelle passait sous le seuil.
              style={{
                color: "var(--text-brand)",
                opacity: day.estPic ? 1 : 0.75,
              }}
            >
              {(() => {
                const d = new Date();
                d.setDate(d.getDate() + i);
                return nomJour.format(d);
              })()}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Screen 4 — Future Peaks : prevision reelle, calculee depuis les phases.
 * Credibility first — shows the actual product component, not a prettier concept.
 */
export function StepPremium({ onNext, onBack }: StepPremiumProps) {
  return (
    <motion.div
      className="flex h-full flex-col"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >

      {/* Back */}
      <motion.button
        type="button"
        onClick={onBack}
        className="mt-4 self-start text-xs font-medium"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="inline -mt-0.5 mr-1"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </motion.button>

      {/* Forecast timeline card */}
      <motion.div
        className="mt-6 overflow-hidden rounded-2xl px-4 py-6"
        style={{
          background:
            // Le degrade part d un violet a 10 % sur --bg-secondary : la carte
            // a deja une surface a elle, distincte du fond de page.
            "linear-gradient(135deg, color-mix(in srgb, var(--accent-purple) 10%, var(--bg-secondary)), var(--bg-secondary))",
        }}
        variants={fadeInUp}
      >
        <p
          className="mb-4 text-center text-[10px] font-medium uppercase"
          style={{
            letterSpacing: "0.15em",
            color: "var(--accent-purple)",
            opacity: 0.5,
          }}
        >
          7-day forecast
        </p>
        <ForecastTimeline />
      </motion.div>

      {/* Headline */}
      <motion.div className="mt-6 text-center" variants={fadeInUp}>
        <h1
          className="font-display text-2xl font-bold"
          style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        >
          See your best moments
          <br />
          before they arrive.
        </h1>
        <p
          className="mt-3 text-sm leading-relaxed"
          style={{ color: "var(--accent-purple)", opacity: 0.7 }}
        >
          Unlock future peaks, stronger windows ahead, and alerts when
          your rhythm starts moving in your favor.
        </p>
      </motion.div>

      {/* Support */}
      <motion.p
        className="mt-2 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        variants={fadeInUp}
      >
        Not more noise. More timing clarity.
      </motion.p>

      {/* Feature rows */}
      <motion.div className="mt-5 space-y-3" variants={fadeInUp}>
        {features.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
              style={{
                background:
                  "color-mix(in srgb, var(--accent-purple) 10%, transparent)",
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: "var(--accent-purple)" }}
              />
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: "var(--accent-purple)" }}
            >
              {text}
            </span>
          </div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div className="mt-auto pt-6" initial={CTA_DEPART} animate={CTA_ARRIVEE} transition={CTA_IMMEDIAT}>
        <button
          type="button"
          onClick={onNext}
          className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
        >
          Continue
        </button>
      </motion.div>
    </motion.div>
  );
}
