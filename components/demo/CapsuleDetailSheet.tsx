"use client";

/**
 * ─── LES COULEURS DE TEXTE, CORRIGEES LE 17/09/2026 ─────────────────────────
 *
 * Christophe, apres avoir ouvert la feuille sur son telephone : « il y a encore
 * de graves problemes de contraste, le "en cours" est illisible, le vert fluo
 * sur le fond mauve clair passe pas du tout ».
 *
 * Mesure du meme jour, sur la feuille ouverte, en THEME CLAIR — neuf textes
 * sous le seuil de 4,5, et zero en theme sombre. Le pire a 2,04 :
 *
 *     2,04   accent-purple sur le fond de la feuille, 9 et 11 px
 *     2,92   text-body sur surface-light
 *     3,67   accent-purple, les libelles en capitales
 *     4,16   text-body-subtle, les dates et le corps
 *
 * La cause n est pas un reglage : ce sont les JETONS eux-memes qui ne portent
 * pas en theme clair. Mesure des paires, sur le fond de la feuille :
 *
 *     --text-heading      15,27   ok
 *     --text-body          5,91   ok
 *     --text-brand         5,90   ok
 *     --text-body-subtle   4,16   SOUS LE SEUIL
 *     --accent-purple      3,67   SOUS LE SEUIL
 *
 * Donc : tout texte en `--accent-purple` passe en `--text-brand`, tout texte en
 * `--text-body-subtle` passe en `--text-body`. Le langage visuel ne change pas
 * — c est la meme famille de violets — seule la valeur monte assez pour etre
 * lue. `--accent-purple` reste pour les FONDS et les traits, ou le seuil ne
 * s applique pas.
 *
 * A REMONTER, parce que ca depasse cet ecran : `--text-body-subtle` vaut 4,16
 * sur le fond principal et 4,15 sur les surfaces claires. Il echoue partout en
 * theme clair, pas seulement ici. Le corriger a la racine retypographierait
 * toute l app, et le langage visuel appartient a Christophe : on signale, on ne
 * decide pas.
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Fire, CalendarMonth, Lightbulb, ChevronDown, ArrowRight, ShareNodes } from "flowbite-react-icons/outline";
import { ShareSignalCard } from "./ShareSignalCard";
import { TypewriterText } from "./TypewriterText";
import { getPersonalizedText, type PersonalizedText } from "@/lib/openai-personalize";
import { detectLocale, t } from "@/lib/i18n-demo";
import { getUserProfileSync } from "@/lib/user-profile";
import { getBirthDataSync } from "@/lib/birth-data";
import { getObservedProfileSync, trackCapsuleOpen, trackDomainClick, trackDomainReadTime } from "@/lib/observed-profile";
import { buildEffectiveProfile, needsRefresh, getStaleFields } from "@/lib/effective-profile";
import { FeedbackThumb } from "@/components/demo/FeedbackThumb";
import { CielDuSignal } from "@/components/demo/CielDuSignal";
import { GrilleDeVie } from "@/components/demo/GrilleDeVie";
import { RegleDeDuree } from "@/components/demo/RegleDeDuree";
import { BandeDuJour } from "@/components/demo/BandeDuJour";
import { heuresDuJour } from "@/lib/soleil";
import { chargerPositions, type Position } from "@/lib/positions-api";
import { formatEuropeanDisplayDate } from "@/lib/european-date";
import { PremiumBlur } from "@/components/demo/PremiumBlur";
import { usePremiumStatus } from "@/lib/premium-gate";
import { MicroRefresh } from "@/components/demo/MicroRefresh";
import {
  planetConfig,
  houseConfig,
  type PlanetKey,
} from "@/lib/domain-config";
import {
  getTimeContext,
  getTierLabel,
  domainKeyToHouseOrNull,
  getDomainNarrative,
  getPlanetNarrative,
  getTransitNarrative,
  getCycleNarrative,
  getLifetimeNarrative,
  getTopicsNarrative,
  translateApiLabel,
  formatDuration,
  getProgressPercent,
  getRarityText,
  getContextualGuidance,
  type TimeContext,
} from "@/lib/detail-helpers";
import type { HouseNumber } from "@/lib/domain-config";
import { trackDomainFeedback } from "@/lib/observed-profile";
import { useTheme } from "next-themes";
import { texteLisible, type ThemeLisible } from "@/lib/contraste";
import { perso } from "@/lib/perso-i18n";
import { jourMoisAnnee, jourMoisAnneeCourt, moisCourt } from "@/lib/dates-i18n";

// ─── Types (imported from timeline) ──────────────────────
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
    // Raw API fields
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
    isVipTransit?: boolean;
    windowStart?: string;
    windowEnd?: string;
    exactDates?: string[];
    parileDate?: string;
    isReturn?: boolean;
    isHalfReturn?: boolean;
    stationType?: string;
    // Lifetime occurrences (from toctoc-app-short)
    allPeriods?: { date: string; endDate?: string; lifetimeNumber: number; totalHits?: number; isCurrent?: boolean }[];
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

// Les mois abreges vivaient ici, en francais, servis aux dix langues. Ils sont
// desormais dans lib/dates-i18n.ts, qui laisse Intl decider du nom ET de
// l ordre — « 22 Oct 2026 » ne se dit pas dans cet ordre en japonais.

// ─── Context Banner Icons ────────────────────────────────
function BannerIcon({ icon, size = 14 }: { icon: string; size?: number }) {
  const locale = detectLocale();
  if (icon === "bolt") return <Fire size={size} />;
  if (icon === "calendar") return <CalendarMonth size={size} />;
  return <Clock size={size} />;
}

// ─── Main Component ──────────────────────────────────────
export function CapsuleDetailSheet({
  capsule,
  dureesVoisines,
  isFuture,
  onClose,
  onNavigateToCapsule,
}: {
  capsule: CapsuleData;
  /**
   * Les durees des autres periodes, en jours.
   *
   * Sans elles, « 1 mois 15 jours » est un chiffre sans echelle : le lecteur
   * n a aucun moyen de savoir si c est beaucoup. Elles ne servent qu a ca, et
   * la regle ne s affiche pas s il n y en a pas assez — mieux vaut le chiffre
   * seul qu une echelle inventee.
   */
  dureesVoisines?: number[];
  isFuture?: boolean;
  onClose: () => void;
  onNavigateToCapsule?: (date: Date) => void;
}) {
  const locale = detectLocale();
  const { resolvedTheme } = useTheme();
  // Gate: blur AI sections for free users on future capsules.
  // usePremiumStatus() fetches /api/billing/me on mount — not spoofable via localStorage.
  const userIsPremium = usePremiumStatus();
  const shouldBlurAi = (isFuture ?? capsule.isFuture) && !userIsPremium;
  const [showMore, setShowMore] = useState(false);
  const [aiText, setAiText] = useState<PersonalizedText | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [streamingCorps, setStreamingCorps] = useState<string | null>(null);
  const [showRefresh, setShowRefresh] = useState<"stressLevel" | "currentGoal" | null>(null);
  const [showShare, setShowShare] = useState(false);
  const openedAt = useState(() => Date.now())[0];

  // Dismiss on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Track capsule open + domain click (observed profile)
  useEffect(() => {
    trackCapsuleOpen();
    const domain = capsule.phases[0]?.domain;
    if (domain) trackDomainClick(domain, capsule.id);
  }, [capsule]);

  // Track read time on unmount
  useEffect(() => {
    return () => {
      const domain = capsule.phases[0]?.domain;
      if (domain) trackDomainReadTime(domain, capsule.id, Date.now() - openedAt);
    };
  }, [capsule, openedAt]);

  // Check if volatile fields need refresh
  useEffect(() => {
    const profile = getUserProfileSync();
    if (!profile) return;
    const stale = getStaleFields(profile);
    if (stale.stressLevel) setShowRefresh("stressLevel");
    else if (stale.currentGoal) setShowRefresh("currentGoal");
  }, []);

  // Load personalized AI text (using effective profile)
  const loadAiText = useCallback(async () => {
    const birthData = getBirthDataSync();
    if (!birthData) return;

    // Build effective profile from declared + observed (optional — works without)
    const declaredProfile = getUserProfileSync();
    const observed = getObservedProfileSync();
    const userProfile = declaredProfile ? buildEffectiveProfile(declaredProfile, observed) : null;

    setAiLoading(true);
    try {
      const phase = capsule.phases[0] as import("@/types/momentum").MomentumPhase | undefined;
      const capsuleContext = {
        tier: capsule.tier,
        isCurrent: capsule.isCurrent,
        isFuture: capsule.isFuture,
        planets: capsule.planets,
        score: phase?.score,
        domain: phase?.domain,
        apiLabel: phase?.apiLabel,
        apiCategory: phase?.apiCategory,
        transitPlanet: phase?.transitPlanet,
        natalPoint: phase?.natalPoint,
        aspect: phase?.aspect,
        apiTopics: phase?.apiTopics,
        startDate: capsule.startDate.toISOString(),
        endDate: capsule.endDate.toISOString(),
        isVipTransit: phase?.isVipTransit,
        durationWeeks: phase?.durationWeeks,
        // Cycle D-R-D info
        cycle: phase?.cycle,
        // Transit window
        windowStart: phase?.windowStart,
        windowEnd: phase?.windowEnd,
        exactDates: phase?.exactDates,
        parileDate: phase?.parileDate,
        // Special transit types
        isReturn: phase?.isReturn,
        isHalfReturn: phase?.isHalfReturn,
        stationType: phase?.stationType,
        // Eclipse data
        eclipseType: phase?.eclipseType,
        // Markers
        markers: phase?.markers,
      };
      const result = await getPersonalizedText(
        capsule.id,
        capsuleContext,
        userProfile,
        birthData.placeOfBirth ?? "",
        detectLocale(),                                  // GPT generates output in user's language
        phase?.boudinIndex,
        phase?.boudinId,
        ({ corps }) => setStreamingCorps(corps)
      );
      if (result) {
        setAiText(result);
        setStreamingCorps(null);
      }
    } catch {
      // Silently fail — fallback to template text
    } finally {
      setAiLoading(false);
    }
  }, [capsule]);

  useEffect(() => {
    loadAiText();
  }, [loadAiText]);

  const phase = capsule.phases[0];

  /**
   * Le ciel de cette periode — les positions REELLES a sa date.
   *
   * Charge a part : le moteur met une seconde a rendre une position. L attendre
   * retarderait tout ce qui est deja pret. La figure apparait quand elle
   * arrive ; si elle n arrive jamais, la feuille est exactement ce qu elle
   * etait avant.
   *
   * Aucun etat d attente n est dessine : un squelette a cet endroit
   * annoncerait une figure qui peut ne pas venir.
   */
  const [ciel, setCiel] = useState<Position[] | null>(null);
  const dateSignal =
    capsule.startDate instanceof Date
      ? capsule.startDate.toISOString().slice(0, 10)
      : String(capsule.startDate ?? "").slice(0, 10);
  /**
   * TOUTES les planetes de la periode, pas trois.
   *
   * Christophe, le 17/09 : « le nombre de points dans les boudins doit etre
   * represente dans l animation du detail ».
   *
   * Il a raison, et ma limite a trois etait arbitraire : le type dit « 1 a 5
   * transits actifs » et la capsule en montre autant de points dans la
   * timeline. Ouvrir la fiche et en trouver moins fait douter du dessin — et
   * quand on doute d un dessin, on n en lit plus aucun.
   *
   * Cinq anneaux tiennent dans le cadre : les rayons sont echelonnes pour ca.
   */
  const clefsCiel = capsule.planets.filter((p) => p in planetConfig).slice(0, 5).join(",");

  /**
   * De quoi dessiner la bande du jour, ou `null`.
   *
   * Le lieu est celui de la NAISSANCE — c est la seule ancre geographique de
   * l app, et c est deja celle que le moteur utilise pour tout le reste. Pour
   * une periode passee, ou la personne se trouvait vraiment est de toute facon
   * inconnaissable : on ne le devine pas.
   */
  const bandeDuJour = useMemo(() => {
    const b = getBirthDataSync();
    if (!b || typeof b.latitude !== "number" || typeof b.longitude !== "number") return null;
    if (!dateSignal) return null;
    // Le decalage du lieu ce jour-la. `Intl` connait les regles de chaque
    // fuseau, y compris l heure d ete — une table figee se tromperait d une
    // heure entiere la moitie de l annee.
    let decalage = 0;
    try {
      const f = new Intl.DateTimeFormat("en-US", { timeZone: b.timezone, timeZoneName: "longOffset" });
      const p = f.formatToParts(new Date(`${dateSignal}T12:00:00Z`)).find((x) => x.type === "timeZoneName");
      const m = p?.value ? /GMT([+-])(\d{2}):(\d{2})/.exec(p.value) : null;
      if (m) decalage = (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3]));
    } catch {
      /* Fuseau inconnu : on reste a UTC plutot que de deviner. */
    }
    const h = heuresDuJour(dateSignal, b.latitude, b.longitude, decalage);
    if (!h || h.lever === null || h.coucher === null) return null;
    const minutes = Math.max(0, Math.round(h.coucher - h.lever));
    return {
      lat: b.latitude,
      lon: b.longitude,
      decalage,
      libelle: t("resume.jour_duree", locale)
        .replace("{h}", String(Math.floor(minutes / 60)))
        .replace("{m}", String(minutes % 60).padStart(2, "0")),
    };
  }, [dateSignal, locale]);

  useEffect(() => {
    if (!dateSignal || !clefsCiel) return;
    let abandonne = false;
    chargerPositions(dateSignal, clefsCiel.split(",")).then((p) => {
      if (!abandonne && p) setCiel(p);
    });
    return () => {
      abandonne = true;
    };
  }, [dateSignal, clefsCiel]);
  const tc = getTimeContext(capsule.isCurrent, capsule.isFuture, locale);
  const tierLabel = getTierLabel(capsule.tier, locale);
  // `?? "work"` transformait toute capsule sans domaine en maison 10 : la fiche
  // affichait la pastille « Carriere » et son recit — « Ta carriere est sous
  // les projecteurs… » — pour un signal dont le domaine etait inconnu. Le
  // domaine reste maintenant indefini, la maison vaut null, et le bloc entier
  // n est pas rendu.
  const domain = phase?.domain;
  const house = domainKeyToHouseOrNull(domain);
  const houseMeta = house !== null ? houseConfig[house] : undefined;
  const houseColor = capsule.color ?? houseMeta?.color ?? "var(--accent-purple)";
  // La couleur vient du moteur : elle peut valoir n importe quoi. Peinte telle
  // quelle sur un fond fait d elle-meme a 15 %, elle donne un texte illisible —
  // meme faute que les puces du briefing, mesuree entre 2,02 et 2,78 en theme
  // clair. On derive la nuance de texte a l execution ; le fond garde la base.
  const themeLisible: ThemeLisible = resolvedTheme === "light" ? "clair" : "sombre";
  const houseTexte = texteLisible(houseColor, themeLisible);
  const progress = getProgressPercent(capsule.startDate, capsule.endDate);
  const duration = formatDuration(capsule.startDate, capsule.endDate, locale);
  // Prefer API lifetime data (from boudin-detail via OpenAI call),
  // then phase lifetime data (from toctoc-app-short).
  // IMPORTANT: never fall back to tierOccurrence/tierTotal (those are NOT lifetime counts).
  const apiLifetimeNum = aiText?.rawLifetime?.number;
  const apiLifetimeTotal = aiText?.rawLifetime?.total;
  const phaseLifetimeNum = (phase as import("@/types/momentum").MomentumPhase | undefined)?.lifetimeNumber;
  const phaseLifetimeTotal = (phase as import("@/types/momentum").MomentumPhase | undefined)?.lifetimeTotal;
  const displayLifetimeNum = apiLifetimeNum ?? phaseLifetimeNum;
  const displayLifetimeTotal = apiLifetimeTotal ?? phaseLifetimeTotal;
  const rarityText = (displayLifetimeNum && displayLifetimeTotal)
    ? getRarityText(displayLifetimeNum, displayLifetimeTotal, "toctoctoc", locale)
    : null;
  const domainNarrative = getDomainNarrative(domain, tc.context, locale);
  const transitNarrative = getTransitNarrative(phase, locale);
  const planetNarrative = transitNarrative || getPlanetNarrative(capsule.planets, locale);
  const topicsNarrative = getTopicsNarrative(phase?.apiTopics, tc.context, locale);
  const cycleNarrative = getCycleNarrative(phase, locale);
  const lifetimeNarrative = getLifetimeNarrative(phase, locale);
  const guidance = getContextualGuidance(domain, tc.context, phase?.guidance, phase?.peakMoment, phase?.apiTopics, locale);

  // Texte IA d abord, puis les replis calcules sur la donnee du moteur. Chacun
  // de ces replis peut valoir null : « toujours visible » n est plus une regle,
  // et les deux cartes disparaissent quand il n y a rien de reel a dire.
  const insightText = aiText?.insight
    || cycleNarrative
    || lifetimeNarrative
    || transitNarrative
    || planetNarrative
    || null;
  const guidanceText = aiText?.guidance || guidance;

  // Lifetime periods list: prefer API/AI payload, fall back to phase data.
  const lifetimePeriods =
    (aiText?.allPeriods && aiText.allPeriods.length > 0 ? aiText.allPeriods : null)
    ?? (phase?.allPeriods && phase.allPeriods.length > 0 ? phase.allPeriods : null);

  // Cycle passes list: prefer API/AI payload, fall back to phase cycle/exactDates.
  const cycleFromAi = aiText?.rawCycle?.allHits && aiText.rawCycle.allHits.length > 1
    ? aiText.rawCycle
    : null;
  const cycleFromPhase = phase?.cycle?.allHits && phase.cycle.allHits.length > 1
    ? { hitNumber: phase.cycle.hitNumber, totalHits: phase.cycle.totalHits, pattern: phase.cycle.pattern, allHits: phase.cycle.allHits }
    : null;
  // `hitNumber ?? 1` etait le vrai defaut : sans objet `cycle`, on ne sait pas
  // ou en est la personne dans le cycle, mais le numero 1 combine au test
  // `hit.hitNumber === cyclePasses.hitNumber` marquait TOUJOURS le premier
  // passage « maintenant » — y compris quand il datait de plusieurs annees.
  // hitNumber reste undefined quand le moteur ne l a pas donne, et le rendu ne
  // marque alors aucun passage.
  const cycleFromExactDates = phase?.exactDates && phase.exactDates.length > 1
    ? {
        hitNumber: phase?.cycle?.hitNumber,
        totalHits: phase?.cycle?.totalHits ?? phase.exactDates.length,
        pattern: phase?.cycle?.pattern ?? "",
        allHits: phase.exactDates.map((date, idx) => ({
          date,
          hitNumber: idx + 1,
          isCurrent: (phase?.cycle?.hitNumber ? idx + 1 === phase.cycle.hitNumber : false),
        })),
      }
    : null;

  const cyclePasses =
    cycleFromAi
    ?? cycleFromPhase
    ?? cycleFromExactDates;

  // Date formatting — exact day/month/year, always show start → end
  const startLabel = jourMoisAnnee(capsule.startDate, locale);
  const endDateLabel = jourMoisAnnee(capsule.endDate, locale);
  // « maintenant » et « Prévu » etaient ecrits en dur, en francais, dans une
  // phrase dont les DATES viennent d Intl. Un lecteur japonais lisait donc
  // « Prévu 2026年10月22日 ». La clef existe en dix langues et sert deja au
  // meme cas dans MomentumTimelineV2.
  const maintenant = perso("timeline.maintenant", locale).toLowerCase();
  const endLabel = capsule.isCurrent ? maintenant : endDateLabel;
  const dateLabel = tc.context === "future"
    ? `${perso("fiche.prevu", locale)} ${startLabel} — ${endDateLabel}`
    : tc.context === "current"
      ? `${startLabel} — ${endDateLabel}`
      : `${startLabel} — ${endDateLabel}`;

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className="absolute inset-x-0 bottom-0 z-[60] flex flex-col"
      style={{
        borderRadius: "1.5rem 1.5rem 0 0",
        // La feuille est deja un cran au-dessus du fond de page :
        // --bg-secondary contre --bg-primary. C est ce decalage de surface qui
        // dit ou elle commence, pas un filet de 1 px sur son bord haut.
        background: "var(--bg-secondary)",
        maxHeight: "85%",
      }}
    >
      {/* ── Section 0: Drag handle ── */}
      <div className="flex-shrink-0 flex justify-center pt-3 pb-1">
        <div className="h-1 w-10 rounded-full" style={{ background: "var(--border-base)" }} />
      </div>

      {/* 80 px en dur pour degager la barre du bas : elle en fait 90 sur un
          iPhone recent (56 plus la zone de securite), donc la derniere ligne
          passait dessous. La feuille recouvre la barre, il suffit donc de
          degager la barre d accueil, et de le faire avec la vraie valeur. */}
      <div
        className="flex-1 overflow-y-auto px-5"
        style={{ paddingBottom: "calc(24px + var(--safe-bottom, 0px))" }}
      >

        {/* ── LE CIEL — les positions reelles a la date de la periode ──

            En tete, et debordant les marges : c est le seul element de l ecran
            a le faire, et c est ce debordement qui le rend dominant, pas une
            hauteur plus grande.

            Il n apparait QUE si le moteur a repondu. Pas de cadre, pas de fond,
            pas de lueur : la figure est posee sur le fond de la feuille. */}
        {ciel && ciel.length > 0 ? (
          <div className="-mx-5 mb-5 flex justify-center">
            <CielDuSignal
              positions={ciel}
              locale={locale}
              dateLisible={formatEuropeanDisplayDate(capsule.startDate)}
              initiale={getBirthDataSync()?.nickname ?? null}
            />
          </div>
        ) : bandeDuJour ? (
          /**
           * TOUTE periode a son illustration, et elle vient AVANT le texte.
           *
           * Christophe, le 17/09 : « les animations ne sont pas sur tous les
           * boudins, elles doivent venir avant le texte ».
           *
           * Il avait raison sur les deux points. Le ciel ne s affiche que si la
           * periode porte des planetes en transit — les periodes de type cycle
           * de vie n en ont aucune, et leur fiche s ouvrait donc directement
           * sur du texte. Un ecran sur deux commencait par une illustration,
           * l autre par un paragraphe : ce n est pas une mise en page, c est un
           * hasard.
           *
           * La bande du jour, elle, est calculable pour N IMPORTE QUELLE date :
           * il suffit d une date et d un lieu, et on a les deux. Elle prend donc
           * la tete quand il n y a pas de ciel a montrer.
           *
           * En tete elle est plus haute et pleine largeur — c est l illustration
           * de l ecran, pas une annexe des metadonnees.
           */
          <div className="-mx-5 mb-5 px-5">
            <BandeDuJour
              date={dateSignal}
              latitude={bandeDuJour.lat}
              longitude={bandeDuJour.lon}
              decalageMinutes={bandeDuJour.decalage}
              libelle={bandeDuJour.libelle}
              hauteur={64}
              dateLisible={formatEuropeanDisplayDate(capsule.startDate)}
            />
          </div>
        ) : null}

        {/* ── L ETAT — une ligne de surtitre, plus une pastille ──

            REECRIT LE 17/09/2026. Christophe : « je veux vraiment une mise en
            page tres elaboree, magnifique a regarder, avec des beaux titres,
            comme un magazine ».

            La pastille avait un fond teinte, un pictogramme et un point qui
            bat — trois marques pour dire une chose. Un magazine ne met pas ce
            qu il a a dire dans une gelule : il l ecrit en petites capitales
            espacees, et le blanc autour fait le reste.

            Le point de couleur reste, parce qu il porte la teinte du domaine et
            qu il bat quand la periode est ouverte. Le pictogramme part : image
            plus mot, c est deux fois le meme mot. */}
        <div className="mb-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {tc.context === "current" && (
            <span
              className="h-[7px] w-[7px] shrink-0 rounded-full animate-pulse"
              style={{ background: houseColor }}
            />
          )}
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ color: "var(--text-heading)", letterSpacing: "0.16em" }}
          >
            {tc.bannerLabel}
          </span>

          {/* LE TIER REJOINT L ETAT, sur la MEME ligne.

              Ils s empilaient : « EN COURS », puis « MOMENT FORT 3/4 », puis
              les dates — trois lignes d etiquettes de suite, en trois couleurs.
              C est le dernier reste de l effet liste : quatre objets qui disent
              tous QUAND, chacun sur sa ligne.

              Une seule ligne, un seul niveau de lecture, et le blanc en dessous
              porte le grand chiffre. */}
          <span
            className="text-[11px] font-semibold uppercase"
            style={{ color: "var(--text-brand)", letterSpacing: "0.16em" }}
          >
            {tierLabel}
          </span>
          {phase?.score !== undefined && (
            <span className="text-[11px] font-semibold" style={{ color: "var(--text-body)" }}>
              {phase.score}/4
            </span>
          )}
        </div>

        {/* ── Micro-refresh (stale volatile fields) ── */}
        {showRefresh && (
          <MicroRefresh
            field={showRefresh}
            onDone={() => {
              // After stress, check if goal also needs refresh
              if (showRefresh === "stressLevel") {
                const p = getUserProfileSync();
                const stale = getStaleFields(p);
                setShowRefresh(stale.currentGoal ? "currentGoal" : null);
              } else {
                setShowRefresh(null);
              }
              // Reload AI text with fresh profile
              loadAiText();
            }}
          />
        )}

        {/* ── L ACCROCHE ──

            Le rang de vie remonte en tete et passe en GOODLY LIGHT a 68 px.

            Pourquoi lui : c est la seule information de la fiche qui soit a la
            fois rare, factuelle, et introuvable ailleurs. Le statut se lit deja
            dans la timeline d ou l on vient, les dates sont des coordonnees, le
            recit est du texte. Le rang, lui, n existe nulle part.

            Pourquoi Goodly, et pourquoi si grand : elle ne devient distinctive
            qu en Light et au-dela de 30 px — en dessous, c est une sans arrondie
            de plus. Un chiffre de 68 px en 300 est exactement le terrain ou
            elle donne ce qu elle a. C est le SEUL element de l ecran a cette
            echelle, et c est cet ecart qui casse l effet tableau.

            `--font-titre`, pas `--font-display` : dans ce depot
            `--font-display` vaut Uniform Rounded. Le chiffre etait donc en
            Uniform, et personne ne l avait vu. */}
        <div className="mb-5">
          {/* `nombre &&` en JSX rend le 0 lui-meme a l ecran : un « 0 » nu
              apparaissait dans la fiche. On teste la presence de la valeur. */}
          {rarityText && displayLifetimeNum !== undefined && displayLifetimeTotal !== undefined && (
            <div className="mt-1 flex items-end gap-3">
              <span
                style={{
                  fontFamily: "var(--font-titre)",
                  fontWeight: 300,
                  fontSize: 68,
                  lineHeight: 0.86,
                  letterSpacing: "-0.04em",
                  color: "var(--text-heading)",
                }}
              >
                {displayLifetimeNum}
                <span
                  className="align-super"
                  style={{ fontSize: 20, fontWeight: 400, color: "var(--text-body)" }}
                >
                  e
                </span>
              </span>
              <div className="flex flex-col gap-2 pb-1.5">
                <span
                  className="max-w-[14ch] text-[15px] leading-[1.25]"
                  style={{ color: "var(--text-body)" }}
                >
                  {rarityText}
                </span>

                {/* LA GRILLE — le denominateur, dessine.

                    « 2ᵉ sur 2 » se lit ; « ■ ■ » se VOIT. Les frequences
                    naturelles sont comprises la ou les pourcentages ne le sont
                    pas, et une grille d unites ne peut pas mentir : elle montre
                    combien de fois la chose peut arriver.

                    Une case par occurrence, toujours la meme case — c est la
                    regle d Isotype : on repete l unite, on ne l agrandit pas.
                    Les passees en aplat efface, celle-ci en couleur, les a
                    venir en contour. Une seule case vive sur toute la grille. */}
                <GrilleDeVie
                  rang={displayLifetimeNum}
                  total={displayLifetimeTotal}
                  accent={houseColor}
                />
              </div>
            </div>
          )}

          {/* Les dates et la duree : UNE phrase, pas deux objets. La gelule de
              duree disait « je suis une donnee a part » alors qu elle finit la
              meme information. Le point median suffit a les separer. */}
          <p className="mt-3 text-[13px] leading-[1.45]" style={{ color: "var(--text-body)" }}>
            {dateLabel} · {duration}
          </p>

          {/* LA BANDE DU JOUR — a quoi ressemblait la journee.

              Vingt-quatre heures decoupees aux heures REELLES du soleil au lieu
              de naissance : nuit, les trois crepuscules, plein jour. Calculees
              en local, sans un seul appel reseau.

              Une journee de decembre et une de juin ne se ressemblent pas, et
              ca se voit sans une etiquette. C est la reponse a « trop de texte
              et pas assez d illustrations » : une image qui se lit en un
              dixieme de seconde et qui ne dit que des faits. */}
          {bandeDuJour && ciel && ciel.length > 0 ? (
            <div className="mt-4 max-w-[300px]">
              <BandeDuJour
                date={dateSignal}
                latitude={bandeDuJour.lat}
                longitude={bandeDuJour.lon}
                decalageMinutes={bandeDuJour.decalage}
                libelle={bandeDuJour.libelle}
              />
            </div>
          ) : null}

          {/* LA REGLE — « long » par rapport a quoi.

              Le chiffre au-dessus ne dit rien tout seul. Ici le trait plein est
              cette periode, le repere vertical la duree habituelle des autres.
              On ne dit jamais « long » : on montre, et le lecteur peut
              contredire le dessin. C est la definition d une illustration
              honnete — l inverse d une jauge, qui dit remplissage, donc
              performance, donc promesse. */}
          {dureesVoisines && dureesVoisines.length > 0 ? (
            <div className="mt-3 max-w-[260px]">
              <RegleDeDuree
                jours={
                  (new Date(capsule.endDate ?? capsule.startDate).getTime() -
                    new Date(capsule.startDate).getTime()) /
                  86400000
                }
                voisines={dureesVoisines}
                accent={houseColor}
                libelleMediane={t("resume.duree_mediane", locale)}
              />
            </div>
          ) : null}
        </div>

        {/* ── LE FILET — le seul de l ecran ──

            Il ne separe pas deux blocs, il separe DEUX NATURES. Au-dessus, ce
            que la machine a mesure : des positions, un rang, des dates. En
            dessous, ce qu on en dit : un domaine, un recit, un conseil.

            C est la seule frontiere de la feuille qui ne soit pas qu un
            changement de sujet, donc la seule qui merite un trait plutot que du
            vide. Partout ailleurs, l ecart fait le travail. Un filet par bloc
            reproduirait la liste de base de donnees qu on vient de defaire. */}
        <div className="mb-6 h-px" style={{ background: "var(--border-base)" }} />

        {/* ── Section 3: Life Areas — fluid phrase with color dots ── */}
        {phase?.apiTopics && phase.apiTopics.length > 0 ? (
          <div className="mb-5">
            <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-2">
              {phase.apiTopics.map((topic: { house: number; color: string; topic: string }, i: number) => {
                const hm = houseConfig[topic.house as HouseNumber];
                // PLUS DE GELULE. Le 17/09, ces pastilles avaient un fond
                // teinte, un point ET un mot : trois marques pour dire un
                // domaine. Une rangee de gelules colorees est exactement ce qui
                // fait lire un ecran comme une liste de champs.
                //
                // Le point garde la couleur — c est sa place mesuree, le texte
                // y tombait a 2,04 — et le mot se pose a cote, sur le fond de
                // la feuille.
                return hm ? (
                  <div key={i} className="flex items-center gap-2">
                    {/* La couleur vit sur le POINT et sur le fond, pas dans les lettres.
                       Mesure du 17/09 en theme clair : le nom du domaine peint
                       dans la couleur du domaine tombait a 2,04, celui d une
                       planete a 1,86. Ces teintes sont faites pour des pastilles
                       et des traits sur fond sombre — en lettres de 11 px sur du
                       mauve clair, elles disparaissent. C est le deuxieme motif
                       recurrent du depot : le texte peint dans la couleur qui
                       teinte son propre fond. */}
                    <div className="h-2 w-2 rounded-full" style={{ background: topic.color }} />
                    <span className="text-[13px] font-medium" style={{ color: "var(--text-heading)" }}>{hm.label}</span>
                  </div>
                ) : null;
              })}
            </div>
            {/* Le chapo : un cran au-dessus du corps, comme dans un magazine.
                C est lui qui donne envie de lire la suite. */}
            <p className="text-[16px] leading-[1.45]" style={{ color: "var(--text-body)" }}>
              {topicsNarrative}
            </p>
          </div>
        ) : houseMeta ? (
          <div className="mb-5">
            <div className="mb-2 flex w-fit items-center gap-2">
              <div className="h-2 w-2 rounded-full" style={{ background: houseColor }} />
              <span className="text-[13px] font-medium" style={{ color: "var(--text-heading)" }}>{houseMeta.label}</span>
            </div>
            <p className="text-[16px] leading-[1.45]" style={{ color: "var(--text-body)" }}>
              {domainNarrative}
            </p>
          </div>
        ) : null}

        {/* ── Section 4: le recit des planetes ──

            LES PASTILLES DE PLANETES ONT DISPARU LE 17/09.

            Elles nommaient « Saturne » et « Soleil » quarante points sous une
            figure qui nomme deja Saturne et Soleil, a leur position. Dire deux
            fois la meme chose sur un ecran qu on fait defiler est la
            redondance la plus couteuse : elle prend la place, et elle affaiblit
            la figure en la faisant passer pour un ornement dont le texte
            dessous serait la version serieuse.

            Le recit, lui, reste : il dit quelque chose que la figure ne dit
            pas. */}
        <div className="mb-5">
          {/* Hide static ZR description once AI story is loaded — AI corps already covers it */}
          {planetNarrative && !(phase?.apiCategory === "zr" && aiText) && (
            <p className="mt-3 text-[12px] leading-relaxed italic" style={{ color: "var(--text-body)" }}>
              {planetNarrative}
            </p>
          )}
        </div>

        {/* ── Section 5: Story — title + description (LLM only) ── */}
        {phase && (shouldBlurAi ? (
          <div className="mb-5">
            <PremiumBlur feature="ai" blurAmount={10} quand={startLabel} capsuleId={capsule.id}>
              <div className="px-1 py-2">
                <span
                  className="text-[9px] font-semibold uppercase tracking-wider"
                  style={{ color: "var(--text-brand)" }}
                >
                  {tc.storyLabel}
                </span>
                <h3 className="mt-1.5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
                  {aiText?.titre || phase.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {aiText?.story || phase.description}
                </p>
              </div>
            </PremiumBlur>
          </div>
        ) : (() => {
          /**
           * Le libelle traduit, calcule UNE fois — et il peut valoir `null`.
           *
           * Depuis le 17/09, `translateApiLabel` refuse de rendre un libelle
           * reste a moitie technique (« Cycle de vie Fortune+Spirit L2
           * Scorpio »). C etait la bonne decision, mais elle a laisse un titre
           * ORPHELIN : « CE QUI SE DEROULE » s affichait au-dessus de rien.
           *
           * Vu sur le simulateur, pas dans le code. Un surtitre sans contenu
           * est pire qu une section absente : il annonce quelque chose qui ne
           * vient pas, et la personne croit que l app a echoue.
           *
           * La section entiere ne s affiche donc que si elle a quelque chose a
           * dire — un libelle, un titre, un recit, ou un chargement en cours.
           */
          const libelle = phase.apiLabel ? translateApiLabel(phase.apiLabel, locale) : null;
          const aQuelqueChose =
            !!libelle || !!aiText?.titre || !!aiText?.story || aiLoading || !!streamingCorps;
          if (!aQuelqueChose) return null;
          return (
          <div className="mb-5">
            <span
              className="text-[9px] font-semibold uppercase tracking-wider"
              style={{ color: "var(--text-brand)" }}
            >
              {tc.storyLabel}
            </span>
            {libelle && (
              <p className="mt-1 text-[11px] font-medium" style={{ color: "var(--text-body)" }}>
                {libelle}
              </p>
            )}
            {aiText?.titre && (
              <h3 className="mt-1.5 text-lg font-semibold leading-tight" style={{ color: "var(--text-heading)" }}>
                {aiText.titre}
              </h3>
            )}
            {aiText?.story ? (
              <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "var(--text-body)" }}>
                <TypewriterText text={aiText.story} speed={50} />
              </p>
            ) : (aiLoading || streamingCorps) ? (
              // Always show shimmer while loading — streaming partial text is never displayed
              // directly because it can contain incomplete words (mid-token truncation).
              <div className="mt-3 space-y-2">
                <div className="h-3 w-4/5 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)" }} />
                <div className="h-3 w-3/5 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--accent-purple) 8%, transparent)" }} />
                <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, transparent)" }} />
              </div>
            ) : null}
          </div>
          );
        })())}

        {/* ── Section 6: Insight Card ── */}
        {/* Always shown (AI text preferred, rich template fallback otherwise) */}
        {/* LA SEULE CARTE DE L ECRAN.

            Elle etait une parmi cinq, toutes au meme dessin : meme rayon, meme
            fond, meme pictogramme. C est cette repetition qui faisait lire la
            feuille comme un tableau — « la boite grise autour de chaque bloc »
            est le marqueur numero un d une interface generee.

            Il n en reste qu une, et c est ce qui lui rend son poids. Son fond
            est `--bg-tertiary` NU : le violet a 6 % pose par-dessus un fond deja
            violet ne se voyait pas et coutait un calcul. Le pictogramme part :
            ampoule plus « insight », c est deux fois le meme mot. */}
        {!shouldBlurAi && (insightText || aiLoading) && (
          <div
            className="mb-5 rounded-2xl px-5 py-4"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div className="mb-2">
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ color: "var(--text-brand)", letterSpacing: "0.16em" }}
              >
                {tc.insightLabel}
              </span>
            </div>
            {insightText ? (
              <p className="text-[16px] leading-[1.5]" style={{ color: "var(--text-body)" }}>
                {aiText?.insight
                  ? <TypewriterText text={insightText} speed={45} />
                  : insightText}
              </p>
            ) : (
              <div className="h-3 w-3/4 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }} />
            )}
          </div>
        )}
        {shouldBlurAi && phase?.keyInsight && (
          <div className="mb-4">
            <PremiumBlur feature="ai" blurAmount={10} quand={startLabel} capsuleId={capsule.id}>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Lightbulb size={12} style={{ color: "var(--text-brand)" }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                    {tc.insightLabel}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {aiText?.insight || phase.keyInsight}
                </p>
              </div>
            </PremiumBlur>
          </div>
        )}

        {aiText?.hitInfo && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                Cycle
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              <TypewriterText text={aiText.hitInfo} speed={45} />
            </p>
          </div>
        )}

        {/* ── Section 6b: Cycle passes (D-R-D multi-hit dates) ── */}
        {cyclePasses?.allHits && cyclePasses.allHits.length > 1 && (
          <div className="mb-4">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
              Passes du cycle ({cyclePasses.totalHits ?? cyclePasses.allHits.length})
            </span>
            {cyclePasses.pattern && (
              <p className="mt-1 text-[10px]" style={{ color: "var(--text-body)" }}>
                {cyclePasses.pattern}
              </p>
            )}
            <div className="mt-2 space-y-1.5">
              {cyclePasses.allHits.map((hit, i) => {
                const d = new Date(hit.date);
                const label = jourMoisAnneeCourt(d, locale);
                // Le passage en cours n est marque que si le moteur a donne un
                // numero de passage. Sans lui, aucun passage n est « maintenant ».
                const isCurrent =
                  ("isCurrent" in hit && hit.isCurrent === true) ||
                  (cyclePasses?.hitNumber !== undefined && hit.hitNumber === cyclePasses.hitNumber);
                const today = new Date();
                const isPast = !isCurrent && d < today;
                const isFuture = !isCurrent && d >= today;
                return (
                  <div key={i} className="flex items-center gap-2">
                    <span
                      className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: isCurrent
                          ? houseColor
                          : isPast
                          ? "color-mix(in srgb, var(--accent-purple) 18%, transparent)"
                          : "color-mix(in srgb, var(--accent-purple) 8%, transparent)",
                        color: isCurrent ? "var(--bg-primary)" : "var(--text-body-subtle)",
                        opacity: isFuture ? 0.5 : 1,
                      }}
                    >
                      {hit.hitNumber}
                    </span>
                    <span
                      className="text-[11px] tabular-nums"
                      style={{
                        color: isCurrent ? "var(--text-heading)" : "var(--text-body-subtle)",
                        fontWeight: isCurrent ? 600 : 400,
                        opacity: isFuture ? 0.5 : 1,
                      }}
                    >
                      {label}
                    </span>
                    {isPast && (
                      <span
                        className="text-[9px] font-semibold rounded px-1 py-0.5"
                        style={{
                          background: "color-mix(in srgb, var(--text-body-subtle) 12%, transparent)",
                          color: "var(--text-body)",
                        }}
                      >
                        {perso("fiche.passe", locale)}
                      </span>
                    )}
                    {isCurrent && (
                      <span
                        className="text-[9px] font-semibold rounded px-1 py-0.5"
                        style={{
                          background: `color-mix(in srgb, ${houseColor} 15%, transparent)`,
                          color: houseTexte,
                        }}
                      >
                        maintenant
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section 7: Guidance / Reflection Card ── */}
        {/* La carte n est plus « toujours affichee ». Elle l etait au prix d une
            phrase de secours generique servie comme conseil personnalise. Sans
            texte ancre dans la donnee — ni IA, ni maison activee, ni guidance du
            moteur — on n affiche pas la carte. */}
        {(guidanceText || aiLoading) && (shouldBlurAi ? (
          <div className="mb-4">
            <PremiumBlur feature="ai" blurAmount={10} quand={startLabel} capsuleId={capsule.id}>
              <div
                className="rounded-xl px-4 py-3"
                style={{ background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))" }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowRight size={12} style={{ color: "var(--text-brand)" }} />
                  <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                    {perso("fiche.preparer", locale)}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
                  {guidanceText}
                </p>
              </div>
            </PremiumBlur>
          </div>
        ) : (
          // LE SECOND TEMPS, PAS UNE SECONDE CARTE.
          //
          // « Pour maintenant » et « en pratique » disent la meme chose a deux
          // distances : ce qui se passe, ce qu on en fait. Deux cartes
          // identiques cote a cote donnent un tableau ; une pensee en deux
          // temps donne une pensee. Le fond disparait, le surtitre reste, et
          // c est l ecart qui separe.
          <div className="mb-5">
            <div className="mb-2">
              <span
                className="text-[11px] font-semibold uppercase"
                style={{ color: "var(--text-brand)", letterSpacing: "0.16em" }}
              >
                {tc.context === "past" ? "Avec le recul" : tc.context === "current" ? "En pratique" : perso("fiche.preparer", locale)}
              </span>
            </div>
            {aiLoading && !guidanceText ? (
              <div className="h-3 w-3/5 rounded animate-pulse" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }} />
            ) : (
              <p className="text-[16px] leading-[1.5]" style={{ color: "var(--text-body)" }}>
                {aiText?.guidance
                  ? <TypewriterText text={aiText.guidance} speed={45} />
                  : guidanceText}
              </p>
            )}
          </div>
        ))}

        {/* ── Section 7b: Lifetime info (LLM narrative) ── */}
        {aiText?.lifetimeInfo && (
          <div
            className="rounded-xl px-4 py-3 mb-4"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                {perso("fiche.dans_ta_vie", locale)}
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              <TypewriterText text={aiText.lifetimeInfo} speed={45} />
            </p>
          </div>
        )}

        {/* ── Section 7c: All lifetime occurrences list ── */}
        {/* Show when total is rare (≤ 10) and we have the dates, OR when total is known but dates aren't loaded yet */}
        {displayLifetimeTotal !== undefined && displayLifetimeTotal <= 10 && !lifetimePeriods && (
          <div className="mb-4">
            {/* Le texte disait « ouvre la fiche pour voir toutes les dates »
                alors qu il est affiche DANS la fiche : il envoyait le lecteur
                chercher un ecran qui n existe pas. On dit ce qu on sait — le
                nombre — et on dit que les dates manquent. */}
            <p className="text-[11px] italic" style={{ color: "var(--text-body)" }}>
              Ce signal se produit {displayLifetimeTotal} fois dans ta vie. Les dates ne sont pas disponibles.
            </p>
          </div>
        )}
        {lifetimePeriods && lifetimePeriods.length >= 1 && (displayLifetimeTotal ?? 99) <= 10 && (
          <div className="mb-4">
            <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
              {phase?.apiLabel ? translateApiLabel(phase.apiLabel, locale) : perso("fiche.ce_signal", locale)} ({lifetimePeriods.length})
            </span>
            <div className="mt-2 space-y-1.5">
              {lifetimePeriods.map((p, i) => {
                const start = new Date(p.date);
                const end = p.endDate ? new Date(p.endDate) : start;
                const startLabel = jourMoisAnneeCourt(start, locale);
                const endLabel = jourMoisAnneeCourt(end, locale);
                const isCurrent = p.isCurrent;
                const canNavigate = !isCurrent && !!onNavigateToCapsule;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                    onClick={canNavigate ? () => { onClose(); onNavigateToCapsule!(start); } : undefined}
                    style={{ cursor: canNavigate ? "pointer" : "default", opacity: isCurrent ? 1 : 0.75 }}
                  >
                    <span
                      className="flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
                      style={{
                        background: isCurrent ? houseColor : "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                        color: isCurrent ? "var(--bg-primary)" : "var(--text-body-subtle)",
                      }}
                    >
                      {p.lifetimeNumber}
                    </span>
                    <span
                      className="text-[11px] tabular-nums flex-1"
                      style={{
                        color: isCurrent ? "var(--text-heading)" : "var(--text-body-subtle)",
                        fontWeight: isCurrent ? 600 : 400,
                      }}
                    >
                      {startLabel} → {endLabel}
                    </span>
                    {p.totalHits && p.totalHits > 1 && (
                      <span
                        className="text-[10px] font-semibold rounded px-1"
                        style={{
                          background: "color-mix(in srgb, var(--accent-purple) 12%, transparent)",
                          color: "var(--text-brand)",
                        }}
                      >
                        ×{p.totalHits}
                      </span>
                    )}
                    {canNavigate && (
                      <ArrowRight size={10} style={{ color: "var(--text-brand)", opacity: 0.5, flexShrink: 0 }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Convergence note ── */}
        {aiText?.convergenceNote && (
          <div
            className="rounded-xl px-4 py-3 mb-5"
            style={{
              background: "color-mix(in srgb, var(--accent-purple) 6%, var(--bg-tertiary))",
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                Convergence
              </span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-body)" }}>
              {aiText.convergenceNote}
            </p>
          </div>
        )}

        {/* ── Section 8: Duration Progress Bar ── */}
        <div className="mb-5">
          <div className="relative h-1 w-full rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--accent-purple) 10%, transparent)" }}>
            <div
              className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: tc.context === "past"
                  ? `color-mix(in srgb, ${houseColor} 40%, transparent)`
                  : houseColor,
              }}
            />
            {tc.context === "current" && (
              <div
                className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full animate-pulse"
                style={{
                  left: `calc(${progress}% - 5px)`,
                  background: houseColor,
                  boxShadow: `0 0 8px ${houseColor}`,
                }}
              />
            )}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[9px] tabular-nums" style={{ color: "var(--text-body)" }}>
              {startLabel}
            </span>
            {/* « maintenant », au bout de la barre de progression. Peint dans
                la couleur de maison, il tombait a 2,04 en theme clair — c est le
                mot qui compte le plus de cette ligne, et c etait le moins
                lisible. La barre, elle, garde la couleur : c est sa place. */}
            <span className="text-[9px] tabular-nums" style={{ color: tc.context === "current" ? "var(--text-heading)" : "var(--text-body)" }}>
              {endLabel}
            </span>
          </div>
        </div>

        {/* ── Feedback + Share ── */}
        {aiText && (
          <div className="flex items-center justify-end gap-3 mb-3">
            {!capsule.isFuture && (
              <button
                type="button"
                onClick={() => setShowShare(true)}
                // 44 points, le minimum d Apple. Le bouton faisait 28x28 : dans
                // une fiche qu on ouvre a chaque signal, on visait a cote une
                // fois sur trois. L icone reste de la meme taille — c est la
                // ZONE DE TOUCHE qui s etend, pas le dessin.
                className="flex items-center justify-center h-11 w-11 rounded-full transition-opacity duration-200"
                style={{
                  color: "var(--text-body)",
                  opacity: 0.3,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.7"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.3"; }}
              >
                <ShareNodes size={14} />
              </button>
            )}
            {/* onFeedback etait absent, donc la branche `if (next && onFeedback)`
                de FeedbackThumb ne s executait jamais : le pouce s affichait,
                reagissait au doigt, ecrivait dans localStorage — et la donnee
                ne quittait jamais l appareil. On demandait un avis qu on ne
                recueillait pas. */}
            <FeedbackThumb
              capsuleId={capsule.id}
              onFeedback={(positive) => {
                // Une capsule peut porter plusieurs domaines : on enregistre l avis
                // pour chacun, sinon le signal serait attribue au hasard.
                for (const d of capsule.domains ?? []) {
                  void trackDomainFeedback(d.domain, capsule.id, positive);
                }
              }}
            />
          </div>
        )}

        {/* ── Section 9: Collapsible More Details ── */}
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1.5 w-full py-2"
        >
          <motion.div animate={{ rotate: showMore ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={14} style={{ color: "var(--text-body)" }} />
          </motion.div>
          <span className="text-[10px] font-medium" style={{ color: "var(--text-body)" }}>
            {perso("fiche.plus", locale)}
          </span>
        </button>

        <AnimatePresence>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 pb-4 pt-1">
                <DetailRow label="Score" value={`${phase?.score ?? "—"} / 4`} />
                <DetailRow label={perso("fiche.intensite", locale)} value={`${phase?.intensity ?? "—"} / 100`} />
                <DetailRow label={perso("fiche.duree", locale)} value={`${capsule.phases[0]?.durationWeeks ?? "—"} semaines`} />
                {/* Meme faute qu au-dessus : `nombre &&` laissait fuir un « 0 »
                    dans la liste. Presence d abord, valeur ensuite. */}
                {displayLifetimeNum !== undefined && displayLifetimeTotal !== undefined && displayLifetimeTotal > 0 && (
                  <DetailRow
                    label="Dans ta vie"
                    value={`${displayLifetimeNum}e occurrence sur ${displayLifetimeTotal}`}
                  />
                )}
                {phase?.apiCategory && (
                  <DetailRow label={perso("fiche.categorie", locale)} value={phase.apiCategory} />
                )}
                {phase?.transitPlanet && phase?.natalPoint && (
                  <DetailRow label="Transit" value={`${phase.transitPlanet} → ${phase.natalPoint}`} />
                )}
                {phase?.aspect && (
                  <DetailRow label="Aspect" value={phase.aspect} />
                )}
                {phase?.isVipTransit && (
                  <DetailRow label="Statut" value="Transit VIP" />
                )}
                {phase?.isReturn && (
                  <DetailRow label="Retour" value={phase?.isHalfReturn ? "Demi-retour" : "Retour complet"} />
                )}
                {phase?.stationType && (
                  <DetailRow label="Station" value={phase.stationType === "SR" ? "Reprise directe" : "Pause rétrograde"} />
                )}
                {phase?.windowStart && phase?.windowEnd && (
                  <DetailRow label={perso("fiche.fenetre", locale)} value={`${phase.windowStart} → ${phase.windowEnd}`} />
                )}
                {phase?.parileDate && (
                  <DetailRow label={perso("fiche.pic", locale)} value={phase.parileDate} />
                )}
                {phase?.exactDates && phase.exactDates.length > 1 && (
                  <DetailRow label="Dates exactes" value={phase.exactDates.join(", ")} />
                )}
                {phase?.eclipseType && (
                  <DetailRow label={perso("fiche.eclipse", locale)} value={phase.eclipseType === "solar" ? "Solaire (nouveau départ)" : "Lunaire (point culminant)"} />
                )}
                {phase?.markers && phase.markers.length > 0 && (
                  <DetailRow label="Marqueurs" value={phase.markers.map((m: string) =>
                    m === "LB" ? "Pivot de vie (LB)" :
                    m === "Cu" ? "Culmination (Cu)" :
                    m === "pre-LB" ? "Pré-pivot (pre-LB)" : m
                  ).join(", ")} />
                )}
                {phase?.cycle && phase.cycle.totalHits > 1 && (
                  <>
                    <DetailRow label="Passage" value={`${phase.cycle.hitNumber} / ${phase.cycle.totalHits}`} />
                    {phase.cycle.pattern && (
                      <DetailRow label={perso("fiche.schema", locale)} value={phase.cycle.pattern} />
                    )}
                  </>
                )}
                {capsule.phases.length > 1 && (
                  <div className="mt-3">
                    <span className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: "var(--text-brand)" }}>
                      {perso("fiche.combines", locale)}
                    </span>
                    {capsule.phases.map((p, i) => (
                      <p key={i} className="text-[11px] mt-1" style={{ color: "var(--text-body)" }}>
                        {translateApiLabel(p.apiLabel, locale) || p.title}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Share Signal Card Overlay ── */}
      <AnimatePresence>
        {showShare && (
          <ShareSignalCard capsule={capsule} onClose={() => setShowShare(false)} />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Detail Row ──────────────────────────────────────────
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-[10px]" style={{ color: "var(--text-body)" }}>{label}</span>
      <span className="text-[10px] tabular-nums font-medium" style={{ color: "var(--text-body)" }}>{value}</span>
    </div>
  );
}
