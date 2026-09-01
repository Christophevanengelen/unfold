"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { mesurerUneFois } from "@/lib/mesure";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";
import { scaleIn } from "@/lib/animations";
import { CheckCircle } from "flowbite-react-icons/solid";
import { useMomentum } from "@/lib/momentum-store";
import { saveBirthData, resolveCity, type BirthData } from "@/lib/birth-data";
import type { OnboardingFormData } from "./StepInput";
import type { MomentumPhase } from "@/types/momentum";
import { planetConfig } from "@/lib/domain-config";
import { t, detectLocale, type Locale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

// Les clefs p6_* existent en dix langues dans lib/i18n-demo.ts depuis le
// debut, et n etaient appelees nulle part : cet ecran servait de l anglais a
// tout le monde.
const statusLines = (locale: Locale) => [
  t("onboarding.p6_status1", locale),
  t("onboarding.p6_status2", locale),
  t("onboarding.p6_status3", locale),
];

// ─── Scan Feed — reveals what the engine is analyzing ────

// Dix-huit textes servis en anglais aux dix langues, pendant que la personne
// regarde son ecran se construire. C est court, mais c est le premier contenu
// qu elle lit du produit.
const SCAN_STEPS = (locale: Locale) => [
  { label: perso("scan.pluton", locale),   detail: perso("scan.pluton.d", locale),   delay: 0.5 },
  { label: perso("scan.neptune", locale),  detail: perso("scan.neptune.d", locale),  delay: 2.5 },
  { label: perso("scan.uranus", locale),   detail: perso("scan.uranus.d", locale),   delay: 4.5 },
  { label: perso("scan.saturne", locale),  detail: perso("scan.saturne.d", locale),  delay: 6.5 },
  { label: perso("scan.jupiter", locale),  detail: perso("scan.jupiter.d", locale),  delay: 8.5 },
  { label: perso("scan.eclipse", locale),  detail: perso("scan.eclipse.d", locale),  delay: 10.5 },
  { label: perso("scan.zr", locale),       detail: perso("scan.zr.d", locale),       delay: 13.0 },
  { label: perso("scan.retro", locale),    detail: perso("scan.retro.d", locale),    delay: 15.5 },
  { label: perso("scan.converge", locale), detail: perso("scan.converge.d", locale), delay: 18.0 },
];

interface IntensityBreakdown {
  label: string;
  count: number;
}

function ScanFeed({ isLoading, phaseCount, breakdown }: { isLoading: boolean; phaseCount: number; breakdown?: IntensityBreakdown[] }) {
  const locale = detectLocale();
  const etapes = SCAN_STEPS(locale);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (!isLoading && phaseCount > 100) {
      // Data arrived — show all remaining instantly
      setVisibleCount(etapes.length);
      return;
    }

    const timers = etapes.map((step, i) =>
      setTimeout(() => setVisibleCount(c => Math.max(c, i + 1)), step.delay * 1000)
    );
    return () => timers.forEach(clearTimeout);
  }, [isLoading, phaseCount]);

  const isDone = !isLoading && phaseCount > 100;

  return (
    <motion.div
      className="mt-8 w-full max-w-[240px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.8, duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-[9px] font-medium uppercase tracking-widest"
          style={{ color: "var(--accent-purple)", opacity: 0.4 }}>
          {t("onboarding.p6_scanning", locale)}
        </span>
      </div>

      <div className="space-y-[6px]">
        {etapes.slice(0, visibleCount).map((step, i) => {
          const isLatest = i === visibleCount - 1 && !isDone;
          return (
            <motion.div
              key={step.label}
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Status dot */}
              <div className="flex-shrink-0">
                {isLatest ? (
                  <motion.div
                    className="h-[5px] w-[5px] rounded-full"
                    style={{ background: "var(--accent-purple)" }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                ) : (
                  <div className="h-[5px] w-[5px] rounded-full"
                    style={{ background: isDone ? "var(--success)" : "var(--accent-purple)", opacity: isDone ? 0.8 : 0.3 }}
                  />
                )}
              </div>

              {/* Label */}
              <span className="text-[10px] font-medium"
                style={{
                  color: "var(--accent-purple)",
                  opacity: isLatest ? 0.8 : 0.35,
                }}>
                {step.label}
              </span>

              {/* Detail — only on latest */}
              {isLatest && (
                <motion.span
                  className="text-[9px] ml-auto"
                  style={{ color: "var(--accent-purple)", opacity: 0.25 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.25 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  {step.detail}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Final count with intensity breakdown */}
      {isDone && (
        <motion.div
          className="mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle size={12} style={{ color: "var(--success)" }} />
            <span className="text-[10px] font-medium"
              style={{ color: "var(--success)", opacity: 0.8 }}>
              {perso("prep.signaux", locale).replace("{n}", String(phaseCount))}
            </span>
          </div>
          {breakdown && (
            <div className="flex items-center gap-3 ml-[18px]">
              {breakdown.map((b) => (
                <span key={b.label} className="text-[9px]"
                  style={{ color: "var(--accent-purple)", opacity: 0.4 }}>
                  <span className="font-semibold" style={{ opacity: 0.7 }}>{b.count}</span> {b.label}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Screen 5 — Preparing Your Signal (Progressive Reveal).
 *
 * After the API returns, instead of a flat "ready" state,
 * we show past phases the user can RECOGNIZE ("ah oui, 2019!").
 * This builds trust and creates the "wow moment".
 *
 * Flow: loading → past reveal → present signal → CTA
 */
export function StepPreparing({ formData }: { formData?: OnboardingFormData }) {
  const locale = detectLocale();
  const router = useRouter();
  // `state` et `reessayer` etaient disponibles et jamais pris : l ecran ne
  // savait donc pas que le moteur avait echoue, et n offrait aucune sortie.
  const { loadSignals, state: etatMoteur, phases, isLoadingLifetime, timelinePhases, reessayer } = useMomentum();

  // Prefetch timeline chunk + route while user watches the reveal
  useEffect(() => {
    import("@/components/demo/MomentumTimelineV2").catch(() => {});
    router.prefetch("/app/timeline");
  }, [router]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [visible, setVisible] = useState<number[]>([0]);
  // Un booleen, plus un message d erreur a afficher : le message disait
  // « donnees d exemple utilisees » alors qu on n en substitue plus aucune.
  const [echecLocal, setEchecLocal] = useState(false);
  const [revealPhase, setRevealPhase] = useState<"loading" | "past" | "present" | "ready">("loading");
  // statusLines est une FONCTION depuis que les libelles sont traduits : sa
  // propriete `.length` vaut donc son ARITE — 1 — et non le nombre d etapes.
  //
  // Consequence, invisible a la lecture : l anneau « termine » s allumait au
  // bout de 800 ms puis repassait au chargement.
  //
  // C est moi qui ai introduit ce defaut en traduisant l ecran ce matin.
  const allDone = completed.length === statusLines(locale).length;
  const didStart = useRef(false);

  // Get memorable past phases for the reveal — prefer lifetime data for deeper history
  // Pick highest-intensity past phases, with variety in years
  const lifetimeSource = timelinePhases.length > 0 ? timelinePhases : phases;
  const pastHighlights = useMemo(() => {
    const candidates = lifetimeSource
      .filter(p => p.status === "past" && p.intensity >= 70)
      .sort((a, b) => b.intensity - a.intensity);
    const picked: typeof candidates = [];
    const usedYears = new Set<number>();
    for (const p of candidates) {
      const year = new Date(p.startDate + "T00:00:00").getFullYear();
      if (!usedYears.has(year)) {
        picked.push(p);
        usedYears.add(year);
        if (picked.length >= 3) break;
      }
    }
    // If not enough unique years, fill from remaining
    if (picked.length < 3) {
      for (const p of candidates) {
        if (!picked.includes(p)) {
          picked.push(p);
          if (picked.length >= 3) break;
        }
      }
    }
    return picked;
  }, [lifetimeSource]);

  // Breakdown by TocToc intensity levels (score 1-4)
  const intensityBreakdown = useMemo(() => {
    if (timelinePhases.length === 0) return undefined;
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>;
    for (const p of timelinePhases) {
      const s = p.score ?? 1;
      counts[Math.min(4, Math.max(1, s))]++;
    }
    // Les quatre niveaux se lisent apres un nombre — « 142 subtils ». Ils
    // etaient poses ici en anglais, donc servis tels quels aux dix langues.
    return [
      { label: perso("niveau.subtil", locale),  count: counts[1] },
      { label: perso("niveau.notable", locale), count: counts[2] },
      { label: perso("niveau.majeur", locale),  count: counts[3] },
      { label: perso("niveau.pic", locale),     count: counts[4] },
    ].filter(b => b.count > 0);
  }, [timelinePhases, locale]);

  // Get current phase
  const currentPhase = phases.find(p => p.status === "current");

  /**
   * L echec du moteur, dans les deux formes qu il prend.
   *
   * 1. `etatMoteur === "error"` : la requete de l annee a echoue. C est le cas
   *    NORMAL d echec depuis que loadSignals ne lance plus rien — il se
   *    contente de poser les donnees de naissance et laisse SWR chercher. Le
   *    try/catch d en dessous ne pouvait donc plus rien attraper, et l ecran
   *    n avait aucun autre moyen de savoir.
   * 2. `echecLocal` : loadSignals lui-meme a leve (donnees illisibles).
   *
   * On y ajoute le cas silencieux : arriver au bout de la revelation avec zero
   * periode. L ecran de fin annonçait alors « Ton signal est actif » et, en
   * sous-titre, « explore avec des donnees d exemple » — a quelqu un qui vient
   * de saisir sa date, son heure et son lieu. Rien n avait ete calcule ; il n y
   * a pas de signal a declarer actif.
   *
   * On ne teste pas `phases.length === 0` en dehors de ce moment precis : avant
   * que loadSignals ait pose les donnees de naissance, la liste est legitimement
   * vide et l etat vaut deja « ready ».
   */
  const enEchec =
    etatMoteur === "error" || echecLocal || (revealPhase === "ready" && phases.length === 0);

  // La revelation du passe n a rien a montrer quand aucune periode passee ne
  // depasse le seuil : on ne laisse pas huit secondes d ecran vide, on passe
  // directement au present.
  const phaseAffichee = enEchec
    ? "echec"
    : revealPhase === "past" && pastHighlights.length === 0
      ? "present"
      : revealPhase;

  useEffect(() => {
    if (didStart.current) return;
    didStart.current = true;

    async function run() {
      setVisible([0]);

      // Use live geocoded coords if available, fall back to hardcoded lookup
      const resolved = formData?.resolvedCoords;
      const coords = resolved
        ? { lat: resolved.lat, lng: resolved.lng, tz: resolved.timezone }
        : resolveCity(formData?.placeOfBirth ?? "");
      // Aucune valeur de repli sur les donnees de naissance.
      //
      // Ce bloc inventait une date (15 janvier 1990), une heure (midi) et un
      // lieu (Bruxelles) quand ils manquaient. Quelqu un qui serait arrive ici
      // sans les avoir saisis aurait reçu le theme d une personne fictive,
      // presente comme le sien, sans le moindre avertissement.
      //
      // L ecran precedent les exige desormais tous les quatre. Si l on arrive
      // ici sans eux, c est un defaut de navigation : on renvoie la personne
      // les saisir plutot que de fabriquer une reponse.
      if (!formData?.dob || !formData?.timeOfBirth || !formData?.placeOfBirth) {
        router.replace("/app/onboarding");
        return;
      }

      // Le lieu n a pas pu etre situe : ni le geocodage, ni la table locale.
      //
      // Avant, resolveCity renvoyait Bruxelles dans ce cas et on continuait.
      // Le theme entier partait alors sur les coordonnees d une ville ou la
      // personne n est pas nee, sans aucun signe. On la renvoie desormais au
      // formulaire, comme pour un champ manquant : c est la meme faute, elle
      // etait seulement une couche plus bas.
      if (!coords) {
        router.replace("/app/onboarding");
        return;
      }

      const birthData: BirthData = {
        // « You » etait servi aux dix langues quand le surnom est vide.
        nickname: formData.nickname || perso("prep.toi", locale),
        birthDate: formData.dob,
        birthTime: formData.timeOfBirth,
        latitude: coords.lat,
        longitude: coords.lng,
        timezone: coords.tz,
        placeOfBirth: formData.placeOfBirth,
      };

      saveBirthData(birthData);

      try {
        setTimeout(() => {
          setCompleted((c) => [...c, 0]);
          setVisible((v) => [...v, 1]);
        }, 800);

        await loadSignals(birthData);

        setCompleted((c) => [...c, 1]);
        setVisible((v) => [...v, 2]);

        setTimeout(() => {
          setCompleted((c) => [...c, 2]);
          // Progressive reveal — respect reading time
          // "ready" is set by the useEffect below when lifetime data arrives
          setTimeout(() => setRevealPhase("past"), 800);       // pause before past reveal
          setTimeout(() => setRevealPhase("present"), 8800);   // 8s to read past highlights
        }, 600);
      } catch {
        // On s ARRETE.
        //
        // Avant, le catch cochait les trois etapes et relançait la meme
        // sequence de revelation : l ecran continuait son animation et
        // finissait sur « Ton signal est actif », coche verte comprise, alors
        // que rien n avait ete calcule. On pose l echec, et rien d autre : la
        // suite du composant affiche l ecran d echec et sa sortie.
        setEchecLocal(true);
      }
    }

    run();
  }, [formData, loadSignals]);

  // Wait for lifetime data to be ready, then show "ready" CTA
  // Minimum 4s on "present" phase so user can read, then wait for data
  const presentShownAt = useRef<number>(0);
  useEffect(() => {
    if (revealPhase === "present") {
      presentShownAt.current = Date.now();
    }
  }, [revealPhase]);

  useEffect(() => {
    if (revealPhase !== "present") return;
    if (isLoadingLifetime) return; // still loading — wait

    // Data is ready. Ensure minimum 4s reading time on "present"
    const elapsed = Date.now() - presentShownAt.current;
    const remaining = Math.max(0, 7000 - elapsed);
    const timer = setTimeout(() => setRevealPhase("ready"), remaining);
    return () => clearTimeout(timer);
  }, [revealPhase, isLoadingLifetime]);

  // Safety timeout — don't block forever if lifetime takes too long (45s max)
  useEffect(() => {
    if (revealPhase !== "present") return;
    const timer = setTimeout(() => setRevealPhase("ready"), 45000);
    return () => clearTimeout(timer);
  }, [revealPhase]);

  return (
    <div // px-5 retire : app/app/onboarding/page.tsx l applique deja au conteneur
    // d etape. Cet ecran seul avait donc 40 px de marge horizontale au lieu de
    // 20, et son contenu etait visiblement plus etroit que celui des autres.
    className="flex h-full flex-col items-center justify-center overflow-y-auto text-center">
      <AnimatePresence mode="wait">
        {/* ── ECHEC — le moteur n a rien rendu ──

            Meme forme que le bloc d echec de la timeline : on dit ce qui se
            passe, on n accuse personne, et on laisse deux portes ouvertes —
            redemander le calcul, ou revenir corriger la saisie. Sans ce bloc,
            une panne du moteur se terminait par une coche verte. */}
        {phaseAffichee === "echec" && (
          <motion.div
            key="echec"
            className="flex flex-col items-center gap-4 px-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-base font-semibold text-text-heading">
              {t("common.echec_titre", locale)}
            </p>
            <p className="max-w-xs text-sm text-text-body-subtle">
              {t("common.echec_corps", locale)}
            </p>
            <button
              type="button"
              onClick={() => {
                setEchecLocal(false);
                reessayer();
              }}
              className="rounded-full px-6 font-semibold transition-transform active:scale-95"
              style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)", minHeight: 48 }}
            >
              {t("common.echec_reessayer", locale)}
            </button>
            <button
              type="button"
              // La deuxieme sortie : le calcul peut aussi echouer parce que la
              // saisie est fausse — une ville introuvable, une heure aberrante.
              // Sans ce retour, la seule issue etait de tuer l app.
              onClick={() => router.replace("/app/onboarding")}
              className="text-xs font-medium underline underline-offset-4"
              style={{ color: "var(--accent-purple)", opacity: 0.6, minHeight: 44 }}
            >
              {t("common.back", locale)}
            </button>
          </motion.div>
        )}

        {/* ── LOADING PHASE ── */}
        {phaseAffichee === "loading" && (
          <motion.div
            key="loading"
            className="flex flex-col items-center"
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Ring indicator */}
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="38" fill="none" stroke="var(--border-muted)" strokeWidth="3" />
                {!allDone && (
                  <motion.circle
                    cx="44" cy="44" r="38" fill="none"
                    stroke="var(--accent-purple)" strokeWidth="3" strokeLinecap="round"
                    strokeDasharray="80 159"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "44px 44px" }}
                  />
                )}
                {allDone && (
                  <motion.circle
                    cx="44" cy="44" r="38" fill="none"
                    stroke="var(--success)" strokeWidth="3" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                )}
              </svg>
            </motion.div>

            <motion.h1
              className="mb-2 font-display text-xl font-bold"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            >
              {perso("prep.titre", locale)}
            </motion.h1>

            <motion.p
              className="mb-6 max-w-[240px] text-xs leading-relaxed"
              style={{ color: "var(--accent-purple)", opacity: 0.5 }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {perso("prep.sous", locale)}
            </motion.p>

            {/* Status lines */}
            <div className="w-full max-w-[240px] space-y-3 text-left">
              <AnimatePresence>
                {statusLines(locale).map((text: string, i: number) =>
                  visible.includes(i) && (
                    <motion.div key={i} className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                        {completed.includes(i) ? (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 15 }}>
                            <CheckCircle className="h-4 w-4" style={{ color: "var(--success)" }} />
                          </motion.div>
                        ) : (
                          <motion.div animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <div className="h-3.5 w-3.5 rounded-full border-2 border-transparent"
                              style={{ borderTopColor: "var(--accent-purple)", borderRightColor: "var(--accent-purple)" }} />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-sm"
                        style={{ color: "var(--accent-purple)", opacity: completed.includes(i) ? 0.7 : 0.5 }}>
                        {text}
                      </span>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        )}

        {/* ── PAST REVEAL — "Reconnais ton passé" ── */}
        {phaseAffichee === "past" && pastHighlights.length > 0 && (
          <motion.div
            key="past"
            className="flex flex-col items-center w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <motion.p
              className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--accent-purple)", opacity: 0.5 }}
            >
              {perso("prep.reconnais", locale)}
            </motion.p>

            <motion.h2
              className="font-display text-xl font-bold mb-6"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
            >
              {perso("prep.passe_forts", locale)}
            </motion.h2>

            <div className="w-full max-w-[280px] space-y-3">
              {pastHighlights.map((phase, i) => (
                <PastPhaseCard key={phase.id} phase={phase} delay={i * 0.3} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── PRESENT REVEAL — current signal ── */}
        {phaseAffichee === "present" && (
          <motion.div
            key="present"
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Le repere « maintenant » et le titre ne s affichent que s il y a
                une periode en cours.

                Le titre tombait sinon sur « Ton signal est actif » : une
                affirmation sur la personne, ecrite en dur, la ou le moteur
                n avait justement rien renvoye pour aujourd hui. Une vie
                comporte des moments sans periode en cours ; on n a alors rien
                a annoncer, et on n annonce rien. */}
            {currentPhase && (
              <>
                <motion.p
                  className="text-[10px] font-semibold uppercase tracking-widest mb-3"
                  style={{ color: "var(--accent-purple)", opacity: 0.5 }}
                >
                  {perso("timeline.maintenant", locale)}
                </motion.p>

                <motion.h2
                  className="font-display text-xl font-bold mb-2"
                  style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
                >
                  {currentPhase.title}
                </motion.h2>

                <motion.p
                  className="mb-4 max-w-[260px] text-sm leading-relaxed"
                  style={{ color: "var(--accent-purple)", opacity: 0.7 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentPhase.description}
                </motion.p>

                {/* Planet pills */}
                <motion.div
                  className="flex flex-wrap justify-center gap-2 mb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {currentPhase.planets.map((planet) => {
                    const cfg = planetConfig[planet];
                    return (
                      <span key={planet} className="rounded-full px-3 py-1 text-xs font-medium"
                        style={{
                          background: `color-mix(in srgb, ${cfg?.color ?? "#9585CC"} 15%, transparent)`,
                          color: cfg?.color ?? "#9585CC",
                        }}>
                        {cfg ? perso(cfg.cleLabel, locale) : planet}
                      </span>
                    );
                  })}
                </motion.div>

                {currentPhase.keyInsight && (
                  <motion.p
                    className="max-w-[240px] text-center text-[11px] italic leading-relaxed"
                    style={{ color: "var(--accent-purple)", opacity: 0.6 }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    &ldquo;{currentPhase.keyInsight}&rdquo;
                  </motion.p>
                )}
              </>
            )}

            {/* Live scan feed — show the science behind the signal */}
            <ScanFeed isLoading={isLoadingLifetime} phaseCount={timelinePhases.length} breakdown={intensityBreakdown} />
          </motion.div>
        )}

        {/* ── READY — CTA ──
            N est atteint que si `enEchec` est faux, donc avec au moins une
            periode calculee : la coche verte et « ton signal est actif » ne
            peuvent plus s afficher sur du vide. */}
        {phaseAffichee === "ready" && (
          <motion.div
            key="ready"
            className="flex flex-col items-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <svg width="64" height="64" viewBox="0 0 88 88">
                <motion.circle
                  cx="44" cy="44" r="38" fill="none"
                  stroke="var(--success)" strokeWidth="3" strokeLinecap="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />
                <motion.path
                  d="M30 44 L40 54 L58 36"
                  fill="none" stroke="var(--success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
                />
              </svg>
            </motion.div>

            <motion.h1
              className="mt-4 font-display text-2xl font-bold"
              style={{ color: "var(--accent-purple)", letterSpacing: -0.3 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {t("onboarding.p6_signal_active", locale)}
            </motion.h1>

            <motion.p
              className="mt-2 max-w-[240px] text-xs leading-relaxed"
              style={{ color: "var(--accent-purple)", opacity: 0.6 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {/* Plus de branche « donnees d exemple ».
                  Elle disait « explore avec des donnees d exemple, saisis ta
                  naissance pour une lecture personnelle » a quelqu un qui
                  venait precisement de la saisir, et servait de decor a un
                  echec. Cet ecran ne s affiche plus que sur des periodes
                  reellement calculees : la phrase peut l affirmer. */}
              {t("onboarding.p6_built_real", locale)}
            </motion.p>

            <motion.div
              className="mt-8 w-full max-w-[240px]"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.5 }}
            >
              <button
                type="button"
                onClick={() => {
                  // Check for pending invite (from invite link → onboarding → connected)
                  const pending = typeof window !== "undefined" ? sessionStorage.getItem("unfold_pending_invite") : null;
                  if (pending) {
                    try {
                      const invite = JSON.parse(pending);
                      const params = new URLSearchParams({
                        name: invite.name,
                        code: invite.code,
                        bd: invite.birthData.birthDate,
                        bt: invite.birthData.birthTime,
                        lat: String(invite.birthData.latitude),
                        lng: String(invite.birthData.longitude),
                        tz: invite.birthData.timezone,
                        place: invite.birthData.placeOfBirth || "",
                      });
                      sessionStorage.removeItem("unfold_pending_invite");
                      router.push(`/app/invite/connected?${params.toString()}`);
                      return;
                    } catch { /* ignore parse errors */ }
                  }
                  mesurerUneFois("onboarding_termine");
                  router.push("/app/timeline");
                }}
                className="flex w-full items-center justify-center rounded-full bg-bg-brand py-3.5 text-sm font-semibold text-text-on-brand shadow-lg transition-transform active:scale-95"
              >
                {perso("prep.cta", locale)}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Past Phase Card (for "Reconnais ton passé") ─────────

function PastPhaseCard({ phase, delay }: { phase: MomentumPhase; delay: number }) {
  const year = new Date(phase.startDate + "T00:00:00").getFullYear();

  return (
    <motion.div
      className="flex items-center gap-3 rounded-2xl px-4 py-3"
      style={{ background: "var(--bg-secondary)" }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      {/* Year */}
      <span
        className="font-display text-2xl font-bold tabular-nums"
        style={{ color: "var(--accent-purple)", opacity: 0.4 }}
      >
        {year}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-text-heading truncate">
          {phase.title}
        </p>
        <p className="text-[10px] text-text-body-subtle truncate">
          {phase.subtitle}
        </p>
      </div>

      {/* Intensity indicator */}
      <div className="flex items-center gap-1">
        {phase.planets.slice(0, 3).map((planet) => {
          const cfg = planetConfig[planet];
          return (
            <div
              key={planet}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: cfg?.color ?? "#9585CC" }}
            />
          );
        })}
      </div>
    </motion.div>
  );
}
