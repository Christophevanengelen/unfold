"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "flowbite-react-icons/outline";
import { BottomSheet } from "@/components/demo/primitives";
import { springs, staggerFast, fadeInUp } from "@/lib/animations";
import type {
  UserProfile,
  LifePhase,
  WorkStatus,
  RelationshipStatus,
  PriorityDomain,
  GuidanceStyle,
  StressLevel,
  CurrentGoalPreset,
} from "@/types/user-profile";
import { detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

// ─── Props ───────────────────────────────────────────────
interface PersonalizeFlowProps {
  open: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
}

// ─── Chip Configs ────────────────────────────────────────

const LIFE_PHASES = (l: Locale): { value: LifePhase; label: string }[] => [
  { value: "stable", label: perso("phase.stable", l) },
  { value: "transition", label: perso("phase.transition", l) },
  { value: "crisis", label: perso("phase.crisis", l) },
  { value: "reconstruction", label: perso("phase.reconstruction", l) },
  { value: "expansion", label: perso("phase.expansion", l) },
];

const WORK_STATUSES = (l: Locale): { value: WorkStatus; label: string }[] => [
  { value: "employee", label: perso("travail.employee", l) },
  { value: "freelance", label: perso("travail.freelance", l) },
  { value: "entrepreneur", label: perso("travail.entrepreneur", l) },
  { value: "student", label: perso("travail.student", l) },
  { value: "job_seeking", label: perso("travail.job_seeking", l) },
  { value: "career_transition", label: perso("travail.career_transition", l) },
];

const RELATIONSHIP_STATUSES = (l: Locale): { value: RelationshipStatus; label: string }[] => [
  { value: "single", label: perso("relation.single", l) },
  { value: "in_relationship", label: perso("relation.in_relationship", l) },
  { value: "unclear", label: perso("relation.unclear", l) },
  { value: "separation", label: perso("relation.separation", l) },
  { value: "other", label: perso("relation.other", l) },
];

const PRIORITIES = (l: Locale): { value: PriorityDomain; label: string }[] => [
  { value: "love", label: perso("priorite.love", l) },
  { value: "career", label: perso("priorite.career", l) },
  { value: "money", label: perso("priorite.money", l) },
  { value: "family", label: perso("priorite.family", l) },
  { value: "health_energy", label: perso("priorite.health_energy", l) },
  { value: "creativity", label: perso("priorite.creativity", l) },
  { value: "home", label: perso("priorite.home", l) },
  { value: "friends_network", label: perso("priorite.friends_network", l) },
  { value: "meaning_spirituality", label: perso("priorite.meaning_spirituality", l) },
];

const GUIDANCE_STYLES = (l: Locale): { value: GuidanceStyle; label: string; desc: string }[] => [
  { value: "direct", label: perso("style.direct", l), desc: perso("style.direct.desc", l) },
  { value: "reassuring", label: perso("style.reassuring", l), desc: perso("style.reassuring.desc", l) },
  { value: "inspiring", label: perso("style.inspiring", l), desc: perso("style.inspiring.desc", l) },
  { value: "pragmatic", label: perso("style.pragmatic", l), desc: perso("style.pragmatic.desc", l) },
];

const STRESS_LEVELS = (l: Locale): { value: StressLevel; label: string }[] => [
  { value: "low", label: perso("stress.low", l) },
  { value: "medium", label: perso("stress.medium", l) },
  { value: "high", label: perso("stress.high", l) },
];

const GOAL_PRESETS = (l: Locale): { value: CurrentGoalPreset; label: string }[] => [
  { value: "stabilize", label: perso("objectif.stabilize", l) },
  { value: "clarify", label: perso("objectif.clarify", l) },
  { value: "advance", label: perso("objectif.advance", l) },
  { value: "protect", label: perso("objectif.protect", l) },
  { value: "change", label: perso("objectif.change", l) },
];

// ─── Max priorities ──────────────────────────────────────
const MAX_PRIORITIES = 3;

// ─── Component ───────────────────────────────────────────

export function PersonalizeFlow({ open, onClose, onComplete }: PersonalizeFlowProps) {
  const l = detectLocale();
  const [screen, setScreen] = useState<1 | 2>(1);

  // Screen 1 state
  const [lifePhase, setLifePhase] = useState<LifePhase | undefined>();
  const [workStatus, setWorkStatus] = useState<WorkStatus | undefined>();
  const [relationshipStatus, setRelationshipStatus] = useState<RelationshipStatus | undefined>();
  const [priorities, setPriorities] = useState<PriorityDomain[]>([]);

  // Screen 2 state
  const [guidanceStyle, setGuidanceStyle] = useState<GuidanceStyle | undefined>();
  const [stressLevel, setStressLevel] = useState<StressLevel | undefined>();
  const [goalPreset, setGoalPreset] = useState<CurrentGoalPreset | undefined>();
  const [goalFreeText, setGoalFreeText] = useState("");

  // Validation
  const screen1Valid = !!lifePhase && priorities.length >= 1;
  const canSubmit = screen1Valid && !!guidanceStyle;

  const togglePriority = useCallback((p: PriorityDomain) => {
    setPriorities((prev) => {
      if (prev.includes(p)) return prev.filter((x) => x !== p);
      if (prev.length >= MAX_PRIORITIES) return prev;
      return [...prev, p];
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    const profile: UserProfile = {
      lifePhase,
      workStatus,
      relationshipStatus,
      priorities,
      guidanceStyle,
      stressLevel,
      currentGoal: goalFreeText.trim() || goalPreset,
      completedAt: new Date().toISOString(),
    };
    onComplete(profile);
  }, [canSubmit, lifePhase, workStatus, relationshipStatus, priorities, guidanceStyle, stressLevel, goalPreset, goalFreeText, onComplete]);

  const handleClose = useCallback(() => {
    setScreen(1);
    onClose();
  }, [onClose]);

  // Slide direction for screen transitions
  const slideDirection = screen === 1 ? -1 : 1;

  return (
    <BottomSheet open={open} onClose={handleClose} maxHeight="92%">
      <div className="flex flex-col px-5 pb-6">
        {/* Header — progress dots + back */}
        <div className="flex items-center justify-between pb-4">
          <div className="w-8">
            {screen === 2 && (
              <motion.button
                type="button"
                onClick={() => setScreen(1)}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={springs.snappy}
                className="flex items-center justify-center"
                style={{ color: "var(--accent-purple)" }}
              >
                <ArrowLeft size={18} />
              </motion.button>
            )}
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: s === screen ? 24 : 8,
                  background:
                    s === screen
                      ? "var(--accent-purple)"
                      : "color-mix(in srgb, var(--accent-purple) 25%, transparent)",
                }}
              />
            ))}
          </div>

          <div className="w-8" />
        </div>

        {/* Screen content with horizontal slide */}
        <div className="relative min-h-[420px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            {screen === 1 ? (
              <motion.div
                key="screen-1"
                initial={{ x: slideDirection * -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={springs.default}
              >
                <ScreenReality
                  lifePhase={lifePhase}
                  setLifePhase={setLifePhase}
                  workStatus={workStatus}
                  setWorkStatus={setWorkStatus}
                  relationshipStatus={relationshipStatus}
                  setRelationshipStatus={setRelationshipStatus}
                  priorities={priorities}
                  togglePriority={togglePriority}
                />
              </motion.div>
            ) : (
              <motion.div
                key="screen-2"
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: slideDirection * 60, opacity: 0 }}
                transition={springs.default}
              >
                <ScreenStyle
                  guidanceStyle={guidanceStyle}
                  setGuidanceStyle={setGuidanceStyle}
                  stressLevel={stressLevel}
                  setStressLevel={setStressLevel}
                  goalPreset={goalPreset}
                  setGoalPreset={setGoalPreset}
                  goalFreeText={goalFreeText}
                  setGoalFreeText={setGoalFreeText}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CTA */}
        <div className="mt-4">
          {screen === 1 ? (
            <button
              type="button"
              disabled={!screen1Valid}
              onClick={() => setScreen(2)}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                background: screen1Valid ? "var(--accent-purple)" : "var(--bg-tertiary)",
                color: screen1Valid ? "#fff" : "var(--text-body-subtle)",
                boxShadow: screen1Valid
                  ? "0 0 24px color-mix(in srgb, var(--accent-purple) 35%, transparent)"
                  : "none",
                opacity: screen1Valid ? 1 : 0.5,
              }}
            >
              {perso("bouton.suivant", l)}
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className="flex w-full items-center justify-center rounded-full py-3.5 text-sm font-semibold transition-all duration-200 active:scale-[0.97]"
              style={{
                background: canSubmit ? "var(--accent-purple)" : "var(--bg-tertiary)",
                color: canSubmit ? "#fff" : "var(--text-body-subtle)",
                boxShadow: canSubmit
                  ? "0 0 24px color-mix(in srgb, var(--accent-purple) 35%, transparent)"
                  : "none",
                opacity: canSubmit ? 1 : 0.5,
              }}
            >
              {perso("bouton.partir", l)}
            </button>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── Screen 1: "Ta réalité" ─────────────────────────────

interface ScreenRealityProps {
  lifePhase: LifePhase | undefined;
  setLifePhase: (v: LifePhase) => void;
  workStatus: WorkStatus | undefined;
  setWorkStatus: (v: WorkStatus) => void;
  relationshipStatus: RelationshipStatus | undefined;
  setRelationshipStatus: (v: RelationshipStatus) => void;
  priorities: PriorityDomain[];
  togglePriority: (v: PriorityDomain) => void;
}

function ScreenReality({
  lifePhase,
  setLifePhase,
  workStatus,
  setWorkStatus,
  relationshipStatus,
  setRelationshipStatus,
  priorities,
  togglePriority,
}: ScreenRealityProps) {
  const l = detectLocale();
  return (
    <motion.div variants={staggerFast} initial="hidden" animate="visible">
      {/* Title */}
      <motion.div variants={fadeInUp} className="mb-5">
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          {perso("ecran1.titre", l)}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-body-subtle)" }}>
          {perso("ecran1.sous", l)}
        </p>
      </motion.div>

      {/* Life phase */}
      <FieldGroup label={perso("groupe.phase", l)} required>
        <div className="flex flex-wrap gap-2">
          {LIFE_PHASES(l).map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={lifePhase === item.value}
              onSelect={() => setLifePhase(item.value)}
            />
          ))}
        </div>
      </FieldGroup>

      {/* Work status */}
      <FieldGroup label={perso("groupe.travail", l)}>
        <div className="flex flex-wrap gap-2">
          {WORK_STATUSES(l).map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={workStatus === item.value}
              onSelect={() => setWorkStatus(item.value)}
            />
          ))}
        </div>
      </FieldGroup>

      {/* Relationship */}
      <FieldGroup label={perso("groupe.relation", l)}>
        <div className="flex flex-wrap gap-2">
          {RELATIONSHIP_STATUSES(l).map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={relationshipStatus === item.value}
              onSelect={() => setRelationshipStatus(item.value)}
            />
          ))}
        </div>
      </FieldGroup>

      {/* Priorities */}
      <FieldGroup label={`${perso("groupe.priorites", l)} (max ${MAX_PRIORITIES})`} required>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES(l).map((item) => (
            <ColorChip
              key={item.value}
              label={item.label}
              domaine={item.value}
              selected={priorities.includes(item.value)}
              disabled={!priorities.includes(item.value) && priorities.length >= MAX_PRIORITIES}
              onSelect={() => togglePriority(item.value)}
            />
          ))}
        </div>
      </FieldGroup>
    </motion.div>
  );
}

// ─── Screen 2: "Ton style" ──────────────────────────────

interface ScreenStyleProps {
  guidanceStyle: GuidanceStyle | undefined;
  setGuidanceStyle: (v: GuidanceStyle) => void;
  stressLevel: StressLevel | undefined;
  setStressLevel: (v: StressLevel) => void;
  goalPreset: CurrentGoalPreset | undefined;
  setGoalPreset: (v: CurrentGoalPreset | undefined) => void;
  goalFreeText: string;
  setGoalFreeText: (v: string) => void;
}

function ScreenStyle({
  guidanceStyle,
  setGuidanceStyle,
  stressLevel,
  setStressLevel,
  goalPreset,
  setGoalPreset,
  goalFreeText,
  setGoalFreeText,
}: ScreenStyleProps) {
  const l = detectLocale();
  return (
    <motion.div variants={staggerFast} initial="hidden" animate="visible">
      {/* Title */}
      <motion.div variants={fadeInUp} className="mb-5">
        <h2
          className="font-display text-xl font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          {perso("ecran2.titre", l)}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--text-body-subtle)" }}>
          {perso("ecran2.sous", l)}
        </p>
      </motion.div>

      {/* Guidance style — illustrated cards */}
      <FieldGroup label={perso("groupe.style", l)} required>
        <div className="grid grid-cols-2 gap-2.5">
          {GUIDANCE_STYLES(l).map((item) => (
            <StyleCard
              key={item.value}
              label={item.label}
              desc={item.desc}
              selected={guidanceStyle === item.value}
              onSelect={() => setGuidanceStyle(item.value)}
              icon={styleIcons[item.value]}
            />
          ))}
        </div>
      </FieldGroup>

      {/* Stress level */}
      <FieldGroup label={perso("groupe.stress", l)}>
        <div className="flex gap-2">
          {STRESS_LEVELS(l).map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={stressLevel === item.value}
              onSelect={() => setStressLevel(item.value)}
              grow
            />
          ))}
        </div>
      </FieldGroup>

      {/* Current goal */}
      <FieldGroup label={perso("groupe.objectif", l)}>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS(l).map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              selected={goalPreset === item.value}
              onSelect={() => {
                setGoalPreset(item.value);
                setGoalFreeText("");
              }}
            />
          ))}
        </div>
        <input
          type="text"
          value={goalFreeText}
          onChange={(e) => {
            setGoalFreeText(e.target.value);
            if (e.target.value.trim()) setGoalPreset(undefined);
          }}
          placeholder={perso("champ.libre", l)}
          maxLength={100}
          className="mt-2.5 w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:opacity-40"
          style={{
            background: "var(--bg-secondary)",
            borderColor: "var(--border-muted)",
            color: "var(--text-body)",
          }}
        />
      </FieldGroup>
    </motion.div>
  );
}

// ─── Shared UI Pieces ────────────────────────────────────

function FieldGroup({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div variants={fadeInUp} className="mb-5">
      <p
        className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em]"
        style={{ color: "var(--text-body-subtle)" }}
      >
        {label}
        {required && (
          <span className="ml-1" style={{ color: "var(--accent-purple)" }}>
            *
          </span>
        )}
      </p>
      {children}
    </motion.div>
  );
}

/** Standard pill/chip selector */
function Chip({
  label,
  selected,
  onSelect,
  grow,
}: {
  label: string;
  selected: boolean;
  onSelect: () => void;
  grow?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.93 }}
      transition={springs.bouncy}
      className={`rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors${grow ? " flex-1 text-center" : ""}`}
      style={{
        background: selected
          ? "color-mix(in srgb, var(--accent-purple) 15%, transparent)"
          : "var(--bg-secondary)",
        borderColor: selected ? "var(--accent-purple)" : "var(--border-muted)",
        color: selected ? "var(--accent-purple)" : "var(--text-body)",
      }}
    >
      {label}
    </motion.button>
  );
}

/** Priority pill with unique color tint */
/**
 * Puce de priorite.
 *
 * Le nom du jeton se DEDUIT de la valeur du domaine plutot que d etre passe a
 * part : les deux ne peuvent donc pas se desynchroniser. Le fond teinte et la
 * bordure prennent la couleur de base — l identite du domaine — tandis que le
 * libelle prend la nuance derivee. Sans cette distinction, texte et fond
 * partagent la teinte et convergent : c est ce qui rendait les neuf domaines
 * illisibles une fois selectionnes. Voir le bloc des domaines dans globals.css.
 */
function ColorChip({
  label,
  domaine,
  selected,
  disabled,
  onSelect,
}: {
  label: string;
  domaine: PriorityDomain;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.93 }}
      transition={springs.bouncy}
      className="rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors disabled:opacity-35"
      style={(() => {
        const base = `var(--domaine-${domaine.replace(/_/g, "-")})`;
        const texte = `var(--domaine-${domaine.replace(/_/g, "-")}-texte)`;
        return {
          background: selected
            ? `color-mix(in srgb, ${base} 18%, transparent)`
            : "var(--bg-secondary)",
          borderColor: selected ? base : "var(--border-muted)",
          color: selected ? texte : "var(--text-body)",
        };
      })()}
    >
      {label}
    </motion.button>
  );
}

/** Style card (guidance style) — larger selectable card */
function StyleCard({
  label,
  desc,
  icon,
  selected,
  onSelect,
}: {
  label: string;
  desc: string;
  icon: React.ReactNode;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.96 }}
      transition={springs.bouncy}
      className="flex flex-col items-start gap-2 rounded-2xl border p-3.5 text-left transition-colors"
      style={{
        background: selected
          ? "color-mix(in srgb, var(--accent-purple) 12%, var(--bg-secondary))"
          : "var(--bg-secondary)",
        borderColor: selected ? "var(--accent-purple)" : "var(--border-muted)",
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-lg"
        style={{
          background: selected
            ? "color-mix(in srgb, var(--accent-purple) 20%, transparent)"
            : "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
        }}
      >
        {icon}
      </div>
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: selected ? "var(--accent-purple)" : "var(--text-heading)" }}
        >
          {label}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug" style={{ color: "var(--text-body-subtle)" }}>
          {desc}
        </p>
      </div>
    </motion.button>
  );
}

// ─── Style Icons (inline SVG, 16px) ─────────────────────

const iconStyle = { width: 16, height: 16, color: "var(--accent-purple)" };

const styleIcons: Record<GuidanceStyle, React.ReactNode> = {
  direct: (
    <svg {...iconStyle} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 8h10M10 5l3 3-3 3" />
    </svg>
  ),
  reassuring: (
    <svg {...iconStyle} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3C5.5 3 3 5 3 7.5S5 13 8 14c3-1 5-3.5 5-6.5S10.5 3 8 3z" />
    </svg>
  ),
  inspiring: (
    <svg {...iconStyle} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M8 2v4M8 14v-4M2 8h4M14 8h-4" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  ),
  pragmatic: (
    <svg {...iconStyle} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12l3-4 2.5 2L12 4" />
    </svg>
  ),
};
