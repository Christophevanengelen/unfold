/**
 * AGENT 3 — le routeur, en TypeScript pur, jamais un appel modele.
 *
 * "Decider quoi demander au moteur, et pour quelle periode" (brief §2, ligne
 * "nous") est un travail de code : la classification de l Appel A dit DE QUOI
 * on parle, ce module dit QUOI appeler et QUAND s arreter. La convergence
 * elle-meme (lib/silence.ts) est un calcul pur sur les donnees du moteur —
 * elle tourne ICI, jamais dans un prompt.
 *
 * Une seule fonction publique, `resoudreConversation`, qui fait le tout :
 * resoudre le sujet, appeler le moteur, faire voter lib/silence.ts, et
 * rendre un `VerdictAstrologue` que lib/astrologue-prompt-redaction.ts (l
 * Appel B) redige tel quel — sans jamais voir les noms de technique.
 */

import {
  referentielDepuisAnnee,
  nourrirPointsNatals,
  type Referentiel,
} from "@/lib/maison-du-boudin";
import {
  votesDepuisBoudins,
  fenetresDeConvergence,
  etatDuJour,
  enJours,
  enIso,
  MAISON_DE_TOPIC,
  type FenetreDAccord,
  type Vote,
} from "@/lib/silence";
import type { ComprehensionUtilisateur, TopicMaison } from "@/lib/astrologue-comprehension";

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";

export interface BirthDataPayload {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface ConnexionConnue {
  id: string;
  name: string;
  relationship: "partner" | "friend" | "family" | "colleague";
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

interface FenetreResumee {
  maisonNum: number;
  force: number;
  declencheur: { boudinId: string; etiquette: string; debut: string; fin: string; niveau: number };
  fond: { boudinId: string; etiquette: string; debut: string; fin: string; niveau: number };
  approximee: boolean;
}

interface ChapitreResume {
  signification: string | null;
}

export type VerdictAstrologue =
  | {
      type: "parle";
      fenetre: FenetreResumee;
      /** Detail du declencheur, si un job d arriere-plan lance a un tour
       * precedent est revenu pret entre-temps (toctoc-boudin-detail, 50-57s —
       * jamais attendu en direct). null tant qu il n est pas arrive. */
      detailSupplementaire?: string | null;
    }
  // Present tense sans fenetre resolue : on s appuie sur la hierarchie deja
  // fournie par daily-briefing-context (<1s), qui ne peut pas nourrir la
  // regle de silence (forme incompatible, voir lib/silence.ts) — c est un
  // signal du moteur deja priorise, pas une convergence recalculee ici.
  | { type: "signal-direct"; llmPayloads: string[] }
  | { type: "silence"; chapitreDeFond: ChapitreResume | null; prochaineFenetre: { debut: string } | null }
  | {
      type: "autre";
      nomAutre: string;
      toi: { domaine: string | null; signification: string | null } | null;
      eux: { domaine: string | null; signification: string | null } | null;
      synastryReelle: false;
    }
  | { type: "personne-introuvable"; nomLibre: string }
  | { type: "indisponible"; raison: "referentiel-indisponible" | "signaux_indisponibles" | "erreur_moteur" }
  | { type: "hors-perimetre"; systeme: string | null }
  | { type: "electionnel-non-supporte" };

export interface DecisionArrierePlan {
  endpoint: "toctoc-boudin-detail" | "toctoc-app-short";
  params: Record<string, unknown>;
}

export interface ResultatRoutage {
  verdict: VerdictAstrologue;
  arrierePlan: DecisionArrierePlan | null;
  /** id du job consomme cette fois-ci (lib/astrologue-session.ts:consommerJob), ou null. */
  jobConsommeId: string | null;
}

/** Un job d arriere-plan revenu pret, tel que lu par lib/astrologue-session.ts. */
export interface JobPret {
  id: string;
  endpoint: "toctoc-boudin-detail" | "toctoc-app-short";
  status: "ready" | "failed";
  params: Record<string, unknown>;
  result: unknown;
}

// ─── Appels moteur directs (server-side, meme convention que les routes
//     openai/* existantes : fetch brut, pas de SDK, pas de proxy interne). ──

async function appellerToctocYear(birthData: BirthDataPayload): Promise<unknown[] | null> {
  try {
    const res = await fetch(`${TOCTOC_BASE}/toctoc-year.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(birthData),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    const boudins = data?.boudins;
    return Array.isArray(boudins) ? boudins : null;
  } catch (err) {
    console.error("[astrologue-routeur] toctoc-year error:", err);
    return null;
  }
}

async function appellerDailyBriefingContext(birthData: BirthDataPayload): Promise<string[]> {
  try {
    const res = await fetch(`${TOCTOC_BASE}/daily-briefing-context.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(birthData),
    });
    if (!res.ok) return [];
    const json = await res.json();
    const ctx = json?.data ?? json;
    const all = [...(ctx?.activeEclipses ?? []), ...(ctx?.activeTransits ?? [])] as Array<{
      priority?: number; orb?: number; llmPayload?: string;
    }>;
    return all
      .filter((s) => s.llmPayload && !s.llmPayload.includes("NaN"))
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || (a.orb ?? 99) - (b.orb ?? 99))
      .slice(0, 3)
      .map((s) => s.llmPayload as string);
  } catch (err) {
    console.error("[astrologue-routeur] daily-briefing-context error:", err);
    return [];
  }
}

interface ConnectionBriefFocus {
  dominantDomains?: string[];
  primarySignal?: { category?: string };
  constructiveDirection?: string;
}
interface ConnectionBriefPeriod {
  personAFocus?: ConnectionBriefFocus;
  personBFocus?: ConnectionBriefFocus;
}

async function appellerConnectionBrief(
  moi: BirthDataPayload,
  eux: ConnexionConnue,
): Promise<ConnectionBriefPeriod | null> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const res = await fetch(`${TOCTOC_BASE}/connection-brief.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        relationship: eux.relationship,
        targetDate: today,
        personA: moi,
        personB: {
          birthDate: eux.birthDate, birthTime: eux.birthTime,
          latitude: eux.latitude, longitude: eux.longitude, timezone: eux.timezone,
        },
        responseWindow: { mode: "connection_month_plus_next", months: 1 },
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const data = json?.data ?? json;
    const periods: ConnectionBriefPeriod[] = data?.connectionBrief?.activePeriods ?? [];
    return periods[0] ?? null;
  } catch (err) {
    console.error("[astrologue-routeur] connection-brief error:", err);
    return null;
  }
}

// ─── Resolution de "autre" contre les connexions enregistrees ────────────

function normaliser(nom: string): string {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function resoudreConnexion(nomLibre: string, connexions: ConnexionConnue[]): ConnexionConnue | null {
  const cible = normaliser(nomLibre);
  if (!cible) return null;
  const exact = connexions.find((c) => normaliser(c.name) === cible);
  if (exact) return exact;
  return connexions.find((c) => normaliser(c.name).includes(cible) || cible.includes(normaliser(c.name))) ?? null;
}

// ─── Selection de la meilleure fenetre de convergence ────────────────────

function chevauche(f: FenetreDAccord, debut: number, fin: number): boolean {
  return f.debut <= fin && f.fin >= debut;
}

function resumerFenetre(f: FenetreDAccord): FenetreResumee {
  return {
    maisonNum: f.maison,
    force: f.force,
    declencheur: {
      boudinId: f.declencheur.boudinId,
      etiquette: f.declencheur.etiquette,
      debut: enIso(f.declencheur.debut),
      fin: enIso(f.declencheur.fin),
      niveau: f.declencheur.niveau,
    },
    fond: {
      boudinId: f.fond.boudinId,
      etiquette: f.fond.etiquette,
      debut: enIso(f.fond.debut),
      fin: enIso(f.fond.fin),
      niveau: f.fond.niveau,
    },
    approximee: f.approximee,
  };
}

function meilleureFenetre(fenetres: FenetreDAccord[], topics: TopicMaison[]): FenetreDAccord {
  const maisonsVoulues = new Set(topics.map((t) => MAISON_DE_TOPIC[t]).filter((h): h is number => h != null));
  return [...fenetres].sort((a, b) => {
    const aMatch = maisonsVoulues.has(a.maison) ? 1 : 0;
    const bMatch = maisonsVoulues.has(b.maison) ? 1 : 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return b.force - a.force || a.fin - a.debut - (b.fin - b.debut) || b.declencheur.niveau - a.declencheur.niveau;
  })[0];
}

// ─── Point d entree ───────────────────────────────────────────────────────

export async function resoudreConversation(
  comprehension: ComprehensionUtilisateur,
  birthData: BirthDataPayload,
  connexions: ConnexionConnue[],
  jobsPrets: JobPret[] = [],
): Promise<ResultatRoutage> {
  // ── Hors perimetre : un autre systeme entierement (numerologie, Human
  //    Design, BaZi...) — voir lib/astrologue-endpoints.ts. Court-circuite
  //    avant tout appel moteur : ce n est pas une question de donnees
  //    manquantes, c est un systeme que cette fonction ne parle pas.
  if (comprehension.horsPerimetre.horsPerimetre) {
    return {
      verdict: { type: "hors-perimetre", systeme: comprehension.horsPerimetre.systemeMentionne },
      arrierePlan: null,
      jobConsommeId: null,
    };
  }

  // ── Electionnel : "quand devrais-je..." — pas encore construit. Voir le
  //    commentaire sur ComprehensionUtilisateur.demandeElection : 20 des 100
  //    questions les plus posees du corpus RAG en relevent. On le dit
  //    plutot que de repondre "ce qui se passe maintenant" a une question
  //    qui demandait "quand agir". ──
  if (comprehension.demandeElection) {
    return { verdict: { type: "electionnel-non-supporte" }, arrierePlan: null, jobConsommeId: null };
  }

  // ── Sujet: une autre personne ──
  if (comprehension.sujet === "autre") {
    const nomLibre = comprehension.autrePersonne?.nomLibre ?? "";
    const connexion = resoudreConnexion(nomLibre, connexions);
    if (!connexion) {
      return { verdict: { type: "personne-introuvable", nomLibre }, arrierePlan: null, jobConsommeId: null };
    }
    const periode = await appellerConnectionBrief(birthData, connexion);
    if (!periode) {
      return { verdict: { type: "indisponible", raison: "signaux_indisponibles" }, arrierePlan: null, jobConsommeId: null };
    }
    const resumer = (f?: ConnectionBriefFocus) =>
      f
        ? {
            domaine: f.dominantDomains?.[0] ?? null,
            signification: f.constructiveDirection ?? null,
          }
        : null;
    return {
      verdict: {
        type: "autre",
        nomAutre: connexion.name,
        toi: resumer(periode.personAFocus),
        eux: resumer(periode.personBFocus),
        // Toujours faux : connection-brief est deux lectures solo reliees par
        // un gabarit, pas un vrai calcul a deux (POUR-MARIE-ANGE-QUESTIONS.md Q6).
        synastryReelle: false,
      },
      arrierePlan: null,
      jobConsommeId: null,
    };
  }

  // ── Sujet: soi, periode non resolue (question au present) ──
  if (!comprehension.periode.resolue || !comprehension.periode.dateDebut) {
    const llmPayloads = await appellerDailyBriefingContext(birthData);
    if (llmPayloads.length === 0) {
      return { verdict: { type: "indisponible", raison: "signaux_indisponibles" }, arrierePlan: null, jobConsommeId: null };
    }
    return { verdict: { type: "signal-direct", llmPayloads }, arrierePlan: null, jobConsommeId: null };
  }

  // ── Sujet: soi, fenetre demandee ──
  const boudins = await appellerToctocYear(birthData);
  if (!boudins) {
    return { verdict: { type: "indisponible", raison: "signaux_indisponibles" }, arrierePlan: null, jobConsommeId: null };
  }

  // Meme convention que lib/silence.ts:302 : les types BoudinAnnee/BoudinConvergence
  // ne sont pas exportes (deliberement flexibles sur des champs optionnels),
  // et la forme reelle vient telle quelle du JSON du moteur.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boudinsTypes = boudins as any[];
  const ref: Referentiel | null = referentielDepuisAnnee(boudinsTypes);
  if (!ref || !ref.unanime) {
    return { verdict: { type: "indisponible", raison: "referentiel-indisponible" }, arrierePlan: null, jobConsommeId: null };
  }
  nourrirPointsNatals(ref, boudinsTypes);

  const votes: Vote[] = votesDepuisBoudins(boudinsTypes, ref);
  const fenetres: FenetreDAccord[] = fenetresDeConvergence(votes);

  const debutJours = enJours(comprehension.periode.dateDebut);
  const finJours = comprehension.periode.dateFin
    ? enJours(comprehension.periode.dateFin)
    : enJours(new Date().toISOString().slice(0, 10));

  const dansLaFenetre = fenetres.filter((f) => chevauche(f, debutJours, finJours));

  const avecDetailEventuel = (f: FenetreDAccord): ResultatRoutage => {
    const resume = resumerFenetre(f);
    // Un job d arriere-plan lance a un tour precedent (voir §5/§11 du plan :
    // toctoc-boudin-detail ne tourne jamais en direct dans une conversation)
    // peut etre revenu pret entre-temps pour EXACTEMENT ce declencheur.
    const jobCorrespondant = jobsPrets.find(
      (j) => j.endpoint === "toctoc-boudin-detail" && j.params?.boudinId === f.declencheur.boudinId,
    );
    let detailSupplementaire: string | null = null;
    let jobConsommeId: string | null = null;
    if (jobCorrespondant) {
      jobConsommeId = jobCorrespondant.id;
      if (jobCorrespondant.status === "ready") {
        const r = jobCorrespondant.result as { llmPayload?: string } | null;
        detailSupplementaire = typeof r?.llmPayload === "string" ? r.llmPayload : null;
      }
      // status === "failed" (id instable, cf. POUR-MARIE-ANGE-QUESTIONS.md Q8) :
      // on consomme quand meme le job pour ne pas le relire indefiniment, et on
      // continue avec les seuls champs de niveau toctoc-year.
    }
    return {
      verdict: { type: "parle", fenetre: resume, detailSupplementaire },
      arrierePlan: jobCorrespondant
        ? null
        : {
            endpoint: "toctoc-boudin-detail",
            params: { ...birthData, boudinLabel: f.declencheur.etiquette, boudinId: f.declencheur.boudinId },
          },
      jobConsommeId,
    };
  };

  if (dansLaFenetre.length > 0) {
    const meilleure = meilleureFenetre(dansLaFenetre, comprehension.topicCandidats);
    return avecDetailEventuel(meilleure);
  }

  // ── Aucune convergence dans la fenetre demandee : le silence, avec le
  //    chapitre de fond en cours et la prochaine fenetre s il y en a une. ──
  const etat = etatDuJour(fenetres, votes, finJours);
  if (etat.parle) {
    // etatDuJour a trouve une fenetre active a `finJours` que le filtre par
    // chevauchement ci-dessus avait manquee (limite : `finJours` seul, pas
    // tout l intervalle) — on la sert plutot que de se taire a tort.
    return avecDetailEventuel(etat.fenetre);
  }

  // `etatDuJour` ne produit jamais les variantes "referentiel-indisponible" /
  // "donnees-absentes" (elles existent dans le type pour d autres appelants) —
  // mais TypeScript ne le sait pas, d ou la garde explicite sur `raison`.
  const fond = !etat.parle && etat.raison === "aucun-accord" ? etat.fond : null;
  const prochaine = !etat.parle && etat.raison === "aucun-accord" ? etat.prochaine : null;

  return {
    verdict: {
      type: "silence",
      // `Vote.etiquette` est le champ le plus proche d une "signification"
      // lisible que porte le type Vote (lib/silence.ts n expose pas
      // periodHousePlacement.signification au niveau du vote) — suffisant
      // pour que l Appel B decrive le chapitre de fond sans jargon.
      chapitreDeFond: fond ? { signification: fond.etiquette || null } : null,
      prochaineFenetre: prochaine ? { debut: enIso(prochaine.debut) } : null,
    },
    arrierePlan: null,
    jobConsommeId: null,
  };
}
