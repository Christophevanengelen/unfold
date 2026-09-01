"use client";

/**
 * Step 3.5 — What matters most.
 *
 * Selection libre : on tape autant de pastilles qu on veut, au moins une.
 * La limite a trois a saute le 31 aout 2026 : elle grisait six pastilles sur
 * neuf des le troisieme choix, ce qui les rendait illisibles et donnait
 * l impression d une erreur plutot que d une regle.
 * This is the ONLY personalization data collected during onboarding.
 * Feeds GPT with priorities to customize text from day 1.
 *
 * Stored immediately in user-profile for the AI pipeline.
 */

import { useState } from "react";
import { motion } from "motion/react";

import { S } from "@/lib/layout-constants";
import type { PriorityDomain } from "@/types/user-profile";
import { t, type Locale } from "@/lib/i18n-demo";
import { useLocale } from "@/lib/use-locale";
import { CTA_IMMEDIAT, CTA_DEPART, CTA_ARRIVEE } from "@/lib/onboarding-motion";
import { useTheme } from "next-themes";
import { texteLisible, texteSurAplat, type ThemeLisible } from "@/lib/contraste";

const EASE = [0.4, 0, 0.2, 1] as const;

interface PriorityOption {
  key: PriorityDomain;
  label: string;
  color: string;
}

const OPTIONS = (locale: Locale): PriorityOption[] => [
  { key: "love",                label: t("onboarding.p4_love", locale),       color: "#BC7A96" },
  { key: "career",              label: t("onboarding.p4_career", locale),     color: "#7B8CC4" },
  { key: "money",               label: t("onboarding.p4_money", locale),      color: "#B8A472" },
  { key: "family",              label: t("onboarding.p4_family", locale),     color: "#C48A6A" },
  { key: "health_energy",       label: t("onboarding.p4_health", locale),     color: "#7BA88A" },
  { key: "creativity",          label: t("onboarding.p4_creativity", locale), color: "#A07FBD" },
  { key: "home",                label: t("onboarding.p4_home", locale),       color: "#C4727A" },
  { key: "friends_network",     label: t("onboarding.p4_friends", locale),    color: "#6FA3A0" },
  { key: "meaning_spirituality",label: t("onboarding.p4_meaning", locale),    color: "#9B85C4" },
];

interface StepPrioritiesProps {
  /**
   * Compteur incremente par le parent a chaque glissement REFUSE.
   *
   * Le bouton affiche la consigne quand on a touche une pastille sans en garder
   * aucune. Le glissement, lui, ne faisait rien du tout : `avancer()` sortait
   * en silence sur `priorities.length === 0`. Deux facons d avancer, une seule
   * qui explique — et c est celle qu on utilise le moins qui restait muette.
   *
   * Un compteur et non un booleen : deux glissements de suite doivent rejouer
   * l alerte, ce qu un booleen deja vrai ne ferait pas.
   */
  refusCount?: number;
  selected: PriorityDomain[];
  onChange: (priorities: PriorityDomain[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPriorities({ selected, onChange, onNext, onBack, refusCount = 0 }: StepPrioritiesProps) {
  const { resolvedTheme } = useTheme();
  const themeLisible: ThemeLisible = resolvedTheme === "light" ? "clair" : "sombre";
  const [touched, setTouched] = useState(false);
  // La langue passe par useLocale : elle est lue HORS de React, donc par
  // useSyncExternalStore. Le useState + useEffect d avant rendait cet ecran une
  // premiere fois EN ANGLAIS puis se corrigeait — un scintillement de langue
  // sur le premier ecran que la personne voit du produit.
  const locale = useLocale();
  const options = OPTIONS(locale);

  const toggle = (key: PriorityDomain) => {
    setTouched(true);
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  const canContinue = selected.length >= 1;
  // On a touche des pastilles, tout deselectionne, et le bouton s est eteint :
  // c est le moment ou la consigne doit se voir. Elle etait la depuis le debut,
  // en violet a 70 % au-dessus des neuf pastilles — donc lue comme un
  // sous-titre decoratif, pas comme la regle qui bloque le bouton.
  // Un glissement refuse vaut un contact : la consigne doit se dire, que la
  // personne ait touche une pastille ou non.
  const bloque = (touched || refusCount > 0) && !canContinue;

  return (
    <motion.div className="flex h-full flex-col">

      {/* Back — top */}
      <motion.button
        type="button"
        onClick={onBack}
        // Zone de touche etendue plutot que bouton agrandi : le libelle fait
        // 16 points, Apple en demande 44, et l agrandir descendrait le titre et
        // les neuf pastilles centrees en dessous.
        className="relative self-start text-xs font-medium before:absolute before:-inset-3.5 before:content-['']"
        style={{ color: "var(--accent-purple)", opacity: 0.5 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6, ease: EASE }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline -mt-0.5 mr-1">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t("onboarding.back", locale)}
      </motion.button>

      {/* Headline — stays at top */}
      <motion.h1
        className="mt-5 text-center font-display text-2xl font-bold"
        style={{ letterSpacing: -0.5, color: "var(--accent-purple)" }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8, ease: EASE }}
      >
        {t("onboarding.p4_headline", locale)}
      </motion.h1>

      <motion.p
        id="priorites-consigne"
        role={bloque ? "alert" : undefined}
        className={`mt-1.5 text-center text-sm ${bloque ? "font-medium" : ""}`}
        style={{
          color: bloque ? "var(--text-heading)" : "var(--accent-purple)",
          opacity: bloque ? 1 : 0.7,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8, ease: EASE }}
      >
        {t("onboarding.p4_sub", locale)}
      </motion.p>

      {/* Pills — centered vertically in remaining space */}
      <div className="flex flex-1 flex-col items-center justify-center">

      {/* Priority pills */}
      <motion.div
        className="mt-6 flex flex-wrap justify-center"
        style={{ gap: S.sm }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
      >
        {options.map((opt, i) => {
          const isSelected = selected.includes(opt.key);

          return (
            <motion.button
              key={opt.key}
              type="button"
              onClick={() => toggle(opt.key)}
              className="rounded-full font-medium transition-all"
              style={{
                fontSize: 13,
                padding: `${S.sm + 2}px ${S.md}px`,
                minHeight: S.touch,
                // Les deux etats etaient illisibles, mesures. Non selectionne :
                // le libelle prenait la couleur pure sur un fond fait d elle a
                // 16 % — 2,19 a 2,88 en theme clair. Selectionne : du blanc sur
                // un aplat a 80 % — 2,06 a 2,71. L etat qu on vient de choisir
                // etait le pire des deux.
                color: isSelected
                  ? texteSurAplat(opt.color, themeLisible, 0.7)
                  : texteLisible(opt.color, themeLisible, 0.16),
                background: isSelected
                  // 70 % et non 80 : a 80, le meilleur des deux textes possibles
                  // plafonnait a 4,41 pour la teinte la plus difficile. A 70 le
                  // pire cas passe a 4,50. Quatre points d opacite, et la puce
                  // devient lisible pour les neuf domaines dans les deux themes.
                  ? `color-mix(in srgb, ${opt.color} 70%, transparent)`
                  : `color-mix(in srgb, ${opt.color} 16%, transparent)`,
                // 70 % contre 16 % : les deux etats de la puce sont deja deux
                // fonds sans rapport l un avec l autre. Le lisere de 1,5 px
                // n avait plus rien a distinguer.
                boxShadow: isSelected ? `0 0 16px color-mix(in srgb, ${opt.color} 25%, transparent)` : "none",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.05, duration: 0.4, ease: EASE }}
              whileTap={{ scale: 0.95 }}
            >
              {opt.label}
            </motion.button>
          );
        })}
      </motion.div>

      {/* Counter — « 0 selectionne(s) » des qu on a touche quelque chose, pour
          que le compte et la consigne racontent la meme chose. */}
      <motion.p
        className="mt-4 text-center text-xs"
        style={{ color: "var(--accent-purple)", opacity: touched ? 0.5 : 0 }}
        animate={{ opacity: touched ? 0.5 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {t("onboarding.p4_selected", locale).replace("{n}", String(selected.length))}
      </motion.p>
      </div>

      {/* CTA */}
      <motion.div
        className="mt-auto pt-6"
        initial={CTA_DEPART}
        animate={CTA_ARRIVEE}
        transition={CTA_IMMEDIAT}
      >
        <button
          type="button"
          // Le bouton n avait AUCUN attribut disabled : seulement un style de
          // desactive. Il restait donc tapable et focalisable, un tap ne
          // produisait rien, et rien ne disait pourquoi. La consigne au-dessus
          // le dit maintenant, et le bouton la designe.
          disabled={!canContinue}
          aria-disabled={!canContinue}
          aria-describedby={!canContinue ? "priorites-consigne" : undefined}
          onClick={() => canContinue && onNext()}
          className={`flex w-full items-center justify-center rounded-full text-sm font-semibold transition-all ${
            canContinue
              ? "bg-bg-brand text-text-on-brand shadow-lg active:scale-95"
              // --text-disabled sur --brand-4 : 1,41 de contraste en clair,
              // 1,87 en sombre. Le contrat de globals.css reserve ce jeton aux
              // elements inactionnables, jamais a du contenu — et ceci est le
              // libelle du bouton principal. --text-body donne 4,72 et 7,30.
              : "cursor-not-allowed bg-brand-4 text-text-body"
          }`}
          style={{ minHeight: S.touch, padding: `${S.sm + S.xs}px 0` }}
        >
          {t("onboarding.p4_cta", locale)}
        </button>
      </motion.div>
    </motion.div>
  );
}
