/**
 * Human-friendly labels for API events.
 * Maps planet + aspect + natal point patterns to titles/descriptions.
 *
 * i18n: the signal-content layer speaks fr + en. UI locales outside fr
 * fall back to en (the API's own text is still fr-only — see i18n-demo
 * note). Use toContentLocale() to map any UI locale to a content locale.
 */

import { planetConfig, type DomainKey, type PlanetKey } from "@/lib/domain-config";

// ─── Content locales ────────────────────────────────────────

export type ContentLocale = "fr" | "en";

/** Map any UI locale (10 supported) to a content locale (fr | en). */
export function toContentLocale(locale: string): ContentLocale {
  return locale === "fr" ? "fr" : "en";
}

// ─── Planet name → PlanetKey mapping ────────────────────────

const PLANET_MAP: Record<string, PlanetKey> = {
  Sun: "sun",
  Moon: "moon",
  Mercury: "mercury",
  Venus: "venus",
  Mars: "mars",
  Jupiter: "jupiter",
  Saturn: "saturn",
  Uranus: "uranus",
  Neptune: "neptune",
  Pluto: "pluto",
  "North Node": "north-node",
  "South Node": "south-node",
  eclipse: "solar-eclipse",
};

/** Extract PlanetKey from an API event label like "Jupiter conjunction natal Sun" */
export function extractPlanet(label: string): PlanetKey {
  // Try transit planet (first word or known planet name)
  for (const [name, key] of Object.entries(PLANET_MAP)) {
    if (label.startsWith(name)) return key;
  }
  // ZR labels: "ZR L2 — Leo (fortune)"
  if (label.includes("ZR")) return "jupiter"; // ZR is Jupiter-based technique
  // Eclipse
  if (label.toLowerCase().includes("eclipse")) return "solar-eclipse";
  // Fallback
  return "mercury";
}

/** Extract natal point from label for domain mapping */
export function extractNatalPoint(label: string): string | null {
  const match = label.match(/natal\s+(\w+)/);
  return match ? match[1] : null;
}

// ─── Domain mapping ─────────────────────────────────────────

const NATAL_DOMAIN: Record<string, DomainKey> = {
  Sun: "health",
  Moon: "love",
  Mercury: "work",
  Venus: "love",
  Mars: "health",
  Jupiter: "work",
  Saturn: "work",
  Ascendant: "health",
  MC: "work",
};

const LOT_DOMAIN: Record<string, DomainKey> = {
  fortune: "work",
  spirit: "work",
  eros: "love",
  victory: "work",
  necessity: "health",
  courage: "health",
};

/**
 * Rabat les douze maisons du moteur sur les trois domaines de l app.
 *
 * Les ancres viennent de DOMAIN_TO_HOUSE (lib/detail-helpers.ts) : love = 7,
 * health = 6, work = 10. Le reste est un choix de produit, ecrit ici pour etre
 * discutable et non enfoui dans une condition :
 *   corps, quotidien, interieur  -> health   (1, 6, 12)
 *   foyer, coeur, couple, intime -> love     (4, 5, 7, 8)
 *   argent, echanges, horizon,
 *   carriere, reseau             -> work     (2, 3, 9, 10, 11)
 *
 * C est la maison calculee par le moteur (periodHousePlacement.house) qui
 * arrive ici — jamais un indice de tableau ni une planete devinee.
 */
const HOUSE_DOMAIN: Record<number, DomainKey> = {
  1: "health", 2: "work", 3: "work", 4: "love", 5: "love", 6: "health",
  7: "love", 8: "love", 9: "work", 10: "work", 11: "work", 12: "health",
};

export function houseToDomain(house: number | null | undefined): DomainKey | null {
  return house != null ? HOUSE_DOMAIN[house] ?? null : null;
}

export function inferDomain(
  category: string,
  label: string,
  lotType?: string,
  house?: number | null
): DomainKey {
  // La maison calculee par le moteur prime sur tout : c est SA traduction.
  const parMaison = houseToDomain(house);
  if (parMaison) return parMaison;
  // ZR events — use lot type
  if (category === "zr" && lotType) {
    const lt = Array.isArray(lotType) ? lotType[0] : lotType;
    return LOT_DOMAIN[lt] || "work";
  }
  // Transit/station — use natal point
  const natal = extractNatalPoint(label);
  if (natal && NATAL_DOMAIN[natal]) return NATAL_DOMAIN[natal];
  // Eclipse — default to love (axis of renewal)
  if (category === "eclipse") return "love";
  // Fallback
  return "work";
}

// ─── Score → Intensity mapping ──────────────────────────────

/** Convert API score (1-4) to intensity (0-100) for tier calculation.
 *  Score 1 (toc)           → intensity <70  → tier TOC (left lane, thin)
 *  Score 2 (toc toc)       → intensity 70-84 → tier TOCTOC (center lane, medium)
 *  Score 3 (toc toc toc)   → intensity 85-92 → tier TOCTOCTOC (right lane, large)
 *  Score 4 (toc toc toc toc) → intensity 93-98 → tier TOCTOCTOC (right lane, large)
 */
export function scoreToIntensity(
  score: number,
  cyclePasses?: number
): number {
  const ranges: Record<number, [number, number]> = {
    1: [45, 65],     // TOC — subtle
    2: [70, 82],     // TOCTOC — clear
    3: [85, 92],     // TOCTOCTOC — peak
    4: [93, 98],     // TOCTOCTOC — exceptional peak
  };
  const [min, max] = ranges[Math.abs(score)] || [50, 60];
  // Multi-pass transits are more intense within their band
  const passBoost = cyclePasses && cyclePasses >= 3 ? 0.8 : cyclePasses === 2 ? 0.5 : 0;
  return Math.min(100, Math.round(min + (max - min) * (0.5 + passBoost * 0.5)));
}

// ─── Title/description generation ───────────────────────────

interface EventMeta {
  title: string;
  subtitle: string;
  description: string;
  keyInsight?: string;
}

type LabelDict = Record<string, Record<string, Partial<EventMeta>>>;

const TRANSIT_LABELS_FR: LabelDict = {
  Pluto: {
    conjunction: { title: "Transformation profonde", subtitle: "Ce qui ne vous sert plus s'efface", description: "Un changement de fond est en cours. Ce qui a fait son temps se retire pour laisser place à quelque chose de plus juste." },
    opposition: { title: "Confrontation nécessaire", subtitle: "La pression extérieure vous fait grandir", description: "Des forces extérieures exigent une adaptation. Ce qui résiste en vous demande à être vu et ajusté." },
    square: { title: "Tension structurelle", subtitle: "Les anciennes fondations craquent", description: "Vous sentez une résistance. Elle pointe exactement là où un changement est en retard. La difficulté est le signal." },
    trine: { title: "Puissance tranquille", subtitle: "La profondeur coule naturellement", description: "Un changement profond se fait en douceur. Pas besoin de forcer — suivez le mouvement." },
  },
  Neptune: {
    conjunction: { title: "Vision élargie", subtitle: "Les frontières se dissolvent", description: "Vos certitudes bougent et c'est normal. L'intuition prend le relais de la logique. Faites confiance à ce que vous ressentez." },
    opposition: { title: "Retour au réel", subtitle: "Les illusions sont confrontées", description: "Ce que vous teniez pour acquis mérite d'être questionné. La clarté reviendra — laissez-lui le temps." },
    square: { title: "Brouillard créatif", subtitle: "La clarté demande de la patience", description: "Tout semble flou en ce moment. Ne forcez aucune décision importante. La patience est votre meilleur atout." },
    trine: { title: "Flux d'inspiration", subtitle: "La créativité est amplifiée", description: "Un canal naturel s'ouvre pour la création, l'intuition, la rêverie. Laissez-vous porter." },
  },
  Uranus: {
    conjunction: { title: "Rupture libératrice", subtitle: "L'inattendu arrive", description: "Ce qui semblait stable bouge. C'est libérateur, même si ça secoue. Accueillez la surprise." },
    opposition: { title: "Appel à la liberté", subtitle: "Quelque chose doit changer", description: "Des événements vous poussent vers plus d'authenticité. Écoutez l'impulsion — elle sait où elle va." },
    square: { title: "Tension électrique", subtitle: "L'agitation monte", description: "L'envie de changement est réelle et pressante. Canalisez cette énergie au lieu de la subir." },
    trine: { title: "Innovation fluide", subtitle: "Les nouvelles idées se posent en douceur", description: "Le changement vient naturellement. C'est le moment d'expérimenter et d'essayer du neuf." },
  },
  Saturn: {
    conjunction: { title: "Nouvelles fondations", subtitle: "La structure se construit", description: "C'est le moment de bâtir du solide. La discipline investie maintenant portera ses fruits pendant des années." },
    opposition: { title: "Heure des comptes", subtitle: "Les résultats sont testés", description: "Ce que vous avez construit est évalué par la réalité. Ce qui est solide tient. Le reste doit évoluer." },
    square: { title: "Croissance exigeante", subtitle: "L'effort est requis", description: "Les obstacles révèlent où il reste du travail. Chaque difficulté surmontée vous rend plus fort." },
    trine: { title: "Progrès régulier", subtitle: "La discipline paie", description: "Le travail de fond porte ses fruits. Les récompenses sont méritées et durables." },
  },
  Jupiter: {
    conjunction: { title: "Fenêtre d'expansion", subtitle: "Les possibilités se multiplient", description: "Les portes s'ouvrent. Les opportunités sont là — soyez prêt à saisir ce qui se présente." },
    opposition: { title: "Besoin d'équilibre", subtitle: "L'excès guette", description: "La croissance est possible mais la modération est clé. Visez l'essentiel, ne vous dispersez pas." },
    square: { title: "Tension de croissance", subtitle: "Ambition contre réalité", description: "L'ambition pousse, la réalité freine. Ajustez le cap sans perdre l'élan." },
    trine: { title: "Alignement favorable", subtitle: "Le flux est avec vous", description: "Les choses se mettent en place. La chance favorise ceux qui agissent — c'est le moment." },
  },
  "South Node": {
    conjunction: { title: "Libération karmique", subtitle: "Ce qui ne vous sert plus s'efface", description: "Le Noeud Sud active un point de votre thème. Il est temps de lâcher les schémas devenus obsolètes pour faire de la place à ce qui vient." },
    opposition: { title: "Tiraillement ancien", subtitle: "Un vieux réflexe résiste", description: "Un ancien schéma vous retient face à un appel de croissance. Observez ce que vous avez du mal à lâcher." },
    square: { title: "Friction de lâcher-prise", subtitle: "Le passé résiste au présent", description: "Un conflit entre un fonctionnement ancien et ce que la situation exige. Le lâcher-prise est la clé." },
  },
  "North Node": {
    conjunction: { title: "Cap de croissance", subtitle: "La direction se clarifie", description: "Le Noeud Nord pointe exactement vers votre direction de croissance. Les opportunités qui se présentent méritent votre pleine attention." },
    opposition: { title: "Recalibrage de direction", subtitle: "Le cap demande un ajustement", description: "Votre direction de vie est questionnée. C'est une invitation à vérifier que vous avancez vers ce qui compte vraiment." },
    square: { title: "Carrefour de vie", subtitle: "Un choix de direction s'impose", description: "Vous êtes à un carrefour. La tension pousse à choisir entre confort du connu et appel de la croissance." },
  },
};

const TRANSIT_LABELS_EN: LabelDict = {
  Pluto: {
    conjunction: { title: "Deep transformation", subtitle: "What no longer serves you falls away", description: "A fundamental shift is underway. What has run its course steps back to make room for something truer." },
    opposition: { title: "Necessary confrontation", subtitle: "Outside pressure makes you grow", description: "External forces demand adaptation. What resists in you is asking to be seen and adjusted." },
    square: { title: "Structural tension", subtitle: "Old foundations are cracking", description: "You feel resistance. It points exactly where change is overdue. The difficulty is the signal." },
    trine: { title: "Quiet power", subtitle: "Depth flows naturally", description: "Deep change is happening gently. No need to force it — follow the movement." },
  },
  Neptune: {
    conjunction: { title: "Widened vision", subtitle: "Boundaries dissolve", description: "Your certainties are shifting, and that's normal. Intuition takes over from logic. Trust what you feel." },
    opposition: { title: "Back to reality", subtitle: "Illusions are being confronted", description: "What you took for granted deserves questioning. Clarity will return — give it time." },
    square: { title: "Creative fog", subtitle: "Clarity asks for patience", description: "Everything feels blurry right now. Don't force any major decision. Patience is your best asset." },
    trine: { title: "Flow of inspiration", subtitle: "Creativity is amplified", description: "A natural channel opens for creation, intuition, daydreaming. Let it carry you." },
  },
  Uranus: {
    conjunction: { title: "Liberating break", subtitle: "The unexpected arrives", description: "What seemed stable is moving. It's liberating, even if it shakes things. Welcome the surprise." },
    opposition: { title: "Call to freedom", subtitle: "Something has to change", description: "Events push you toward more authenticity. Listen to the impulse — it knows where it's going." },
    square: { title: "Electric tension", subtitle: "Restlessness is rising", description: "The urge for change is real and pressing. Channel this energy instead of enduring it." },
    trine: { title: "Fluid innovation", subtitle: "New ideas land gently", description: "Change comes naturally. This is the moment to experiment and try something new." },
  },
  Saturn: {
    conjunction: { title: "New foundations", subtitle: "Structure is being built", description: "This is the moment to build something solid. The discipline you invest now will pay off for years." },
    opposition: { title: "Moment of reckoning", subtitle: "Results are being tested", description: "What you've built is being evaluated by reality. What's solid holds. The rest must evolve." },
    square: { title: "Demanding growth", subtitle: "Effort is required", description: "Obstacles reveal where work remains. Every difficulty overcome makes you stronger." },
    trine: { title: "Steady progress", subtitle: "Discipline pays off", description: "The groundwork is bearing fruit. The rewards are earned and lasting." },
  },
  Jupiter: {
    conjunction: { title: "Window of expansion", subtitle: "Possibilities multiply", description: "Doors are opening. Opportunities are here — be ready to seize what shows up." },
    opposition: { title: "Need for balance", subtitle: "Excess is lurking", description: "Growth is possible but moderation is key. Aim for what matters, don't scatter yourself." },
    square: { title: "Growth tension", subtitle: "Ambition versus reality", description: "Ambition pushes, reality slows. Adjust the course without losing momentum." },
    trine: { title: "Favorable alignment", subtitle: "The flow is with you", description: "Things are falling into place. Luck favors those who act — this is the moment." },
  },
  "South Node": {
    conjunction: { title: "Karmic release", subtitle: "What no longer serves you falls away", description: "The South Node activates a point in your chart. It's time to release outdated patterns to make room for what's coming." },
    opposition: { title: "Old pull", subtitle: "An old reflex resists", description: "An old pattern holds you back from a call to grow. Notice what you find hard to let go of." },
    square: { title: "Letting-go friction", subtitle: "The past resists the present", description: "A conflict between an old way of operating and what the situation demands. Letting go is the key." },
  },
  "North Node": {
    conjunction: { title: "Growth heading", subtitle: "The direction becomes clear", description: "The North Node points exactly toward your direction of growth. The opportunities showing up deserve your full attention." },
    opposition: { title: "Course recalibration", subtitle: "The heading needs adjusting", description: "Your life direction is being questioned. It's an invitation to check you're moving toward what really matters." },
    square: { title: "Life crossroads", subtitle: "A choice of direction is due", description: "You're at a crossroads. The tension pushes you to choose between the comfort of the known and the call to grow." },
  },
};

const ZR_LABELS_FR: Record<string, Partial<EventMeta>> = {
  fortune: { title: "Pic de circonstances", subtitle: "Le timing favorise l'action", description: "Une période de pic pour vos circonstances matérielles et votre vie quotidienne." },
  spirit: { title: "Pic de vocation", subtitle: "Votre direction se clarifie", description: "Votre sens du but s'aiguise. Suivez ce qui résonne avec votre mission." },
  eros: { title: "Pic de désir", subtitle: "L'attraction s'intensifie", description: "Le désir et l'attraction sont amplifiés. Les relations s'activent." },
};

const ZR_LABELS_EN: Record<string, Partial<EventMeta>> = {
  fortune: { title: "Circumstances peak", subtitle: "Timing favors action", description: "A peak period for your material circumstances and daily life." },
  spirit: { title: "Calling peak", subtitle: "Your direction sharpens", description: "Your sense of purpose is sharpening. Follow what resonates with your mission." },
  eros: { title: "Desire peak", subtitle: "Attraction intensifies", description: "Desire and attraction are amplified. Relationships come alive." },
};

const LOT_WORD: Record<ContentLocale, Record<string, string>> = {
  fr: { fortune: "circonstances", spirit: "vocation", eros: "désir" },
  en: { fortune: "circumstances", spirit: "calling", eros: "desire" },
};

export function getEventMeta(
  category: string,
  label: string,
  aspect?: string,
  lotType?: string,
  level?: number,
  markers?: string[],
  locale: ContentLocale = "fr"
): EventMeta {
  const fr = locale === "fr";

  // ZR events — differentiate by marker (LB, Cu, pre-LB, peak)
  if (category === "zr") {
    const lt = Array.isArray(lotType) ? lotType[0] : lotType || "fortune";
    const lotLabel = LOT_WORD[locale][lt] || LOT_WORD[locale].fortune;

    // LB — Loosening of the Bond (major life pivot)
    if (markers?.includes("LB")) {
      return fr
        ? {
            title: "Pivot majeur",
            subtitle: `Votre ${lotLabel} change de cap`,
            description: `Un tournant décisif dans votre ${lotLabel}. Ce qui a été construit arrive à maturité et la séquence "saute" vers un nouveau chapitre. Ce qui a été semé ces dernières années porte ses fruits ou se transforme.`,
            keyInsight: "C'est l'un des pivots les plus marquants de votre timeline. Ce qui change ici redéfinit la direction.",
          }
        : {
            title: "Major pivot",
            subtitle: `Your ${lotLabel} changes course`,
            description: `A decisive turning point in your ${lotLabel}. What was built reaches maturity and the sequence "jumps" to a new chapter. What was planted these past years bears fruit or transforms.`,
            keyInsight: "One of the most defining pivots on your timeline. What changes here redefines the direction.",
          };
    }

    // Culmination — 10th sign from the lot (peak of cycle)
    if (markers?.includes("Cu")) {
      return fr
        ? {
            title: "Apogée du cycle",
            subtitle: `Le sommet de votre ${lotLabel}`,
            description: `Ce qui a été construit dans le domaine de votre ${lotLabel} atteint son point culminant. C'est le moment où les résultats deviennent visibles et tangibles.`,
            keyInsight: "Le sommet du cycle — ce que vous avez bâti est maintenant à son plus haut. Observez ce qui se manifeste.",
          }
        : {
            title: "Cycle culmination",
            subtitle: `The summit of your ${lotLabel}`,
            description: `What you've built in the realm of your ${lotLabel} reaches its high point. This is when results become visible and tangible.`,
            keyInsight: "The peak of the cycle — what you've built is now at its highest. Watch what manifests.",
          };
    }

    // pre-LB — Foreshadowing (seed of a future pivot)
    if (markers?.includes("pre-LB")) {
      return fr
        ? {
            title: "Période graine",
            subtitle: `Un pivot futur se prépare`,
            description: `Ce qui se passe maintenant dans votre ${lotLabel} prépare un tournant futur. Les thèmes qui émergent sont les graines d'un changement majeur à venir dans ~8 ans.`,
            keyInsight: "Période de foreshadowing — ce qui émerge maintenant annonce un pivot futur. Observez les thèmes récurrents.",
          }
        : {
            title: "Seed period",
            subtitle: `A future pivot is forming`,
            description: `What happens now in your ${lotLabel} prepares a future turning point. The themes emerging today are the seeds of a major change ~8 years out.`,
            keyInsight: "A foreshadowing period — what emerges now announces a future pivot. Watch the recurring themes.",
          };
    }

    // Regular peak
    const dict = fr ? ZR_LABELS_FR : ZR_LABELS_EN;
    const base = dict[lt] || dict.fortune;
    return {
      title: base.title || (fr ? "Changement de rythme" : "Change of rhythm"),
      subtitle: base.subtitle || (fr ? "Le timing est avec vous" : "Timing is on your side"),
      description: base.description || (fr ? "Une fenêtre de timing significative est ouverte." : "A significant timing window is open."),
      keyInsight: level === 2 ? (fr ? "C'est une période rare et à fort impact. Agissez." : "This is a rare, high-impact period. Act.") : undefined,
    };
  }

  // Eclipse events
  if (category === "eclipse") {
    const isSolar = label.toLowerCase().includes("solar");
    return fr
      ? {
          title: isSolar ? "Nouveau départ" : "Point culminant",
          subtitle: isSolar ? "Un nouveau chapitre s'ouvre" : "Libération émotionnelle",
          description: isSolar
            ? "Un tournant se dessine. Ce qui est semé maintenant grandira pendant les 6 prochains mois."
            : "Ce qui couvait émotionnellement arrive à maturité. C'est le moment de lâcher ce qui ne fonctionne plus.",
        }
      : {
          title: isSolar ? "Fresh start" : "Culmination point",
          subtitle: isSolar ? "A new chapter opens" : "Emotional release",
          description: isSolar
            ? "A turning point is taking shape. What you plant now will grow over the next 6 months."
            : "What was brewing emotionally reaches maturity. This is the moment to release what no longer works.",
        };
  }

  // Station events
  if (category === "station") {
    const isDirect = label.includes(" SD ");
    return fr
      ? {
          title: isDirect ? "Reprise de l'élan" : "Pause et révision",
          subtitle: isDirect ? "La clarté revient" : "Le rythme ralentit",
          description: isDirect
            ? "L'élan reprend après une période de révision. La clarté revient — avancez."
            : "Une période de recul et de recalibration commence. Ralentissez pour mieux repartir.",
        }
      : {
          title: isDirect ? "Momentum resumes" : "Pause and review",
          subtitle: isDirect ? "Clarity returns" : "The pace slows down",
          description: isDirect
            ? "Momentum picks back up after a period of review. Clarity returns — move forward."
            : "A period of stepping back and recalibrating begins. Slow down to restart stronger.",
        };
  }

  // Transit events — look up by planet + aspect
  const transitDict = fr ? TRANSIT_LABELS_FR : TRANSIT_LABELS_EN;
  for (const [planetName, aspects] of Object.entries(transitDict)) {
    if (label.includes(planetName)) {
      const asp = aspect || "conjunction";
      const meta = aspects[asp];
      if (meta) {
        return {
          title: meta.title || (fr ? "Transit actif" : "Active transit"),
          subtitle: meta.subtitle || (fr ? "Signal détecté" : "Signal detected"),
          description: meta.description || (fr ? "Un signal planétaire est actif dans votre thème." : "A planetary signal is active in your chart."),
        };
      }
    }
  }

  // Fallback
  return fr
    ? {
        title: "Signal actif",
        subtitle: "Changement de rythme détecté",
        description: "Une configuration planétaire influence cette période.",
      }
    : {
        title: "Active signal",
        subtitle: "Change of rhythm detected",
        description: "A planetary configuration is shaping this period.",
      };
}
