/**
 * Parcourt les memes techniques que l outil ouvert (app.astrolearn.io) :
 * transits, profections, ZR (Lot de l Esprit), eclipses, periodes planetaires,
 * numerologie — puis ne garde que ce qui touche le domaine demande.
 *
 * Les endpoints sont ceux de C:\Users\marie\Documents\dev\63.astrolearn-revamp-website-webapp\app-astrolearn-newwebsite
 * (routes /api/astrolearn/public/* → calculateur Marie-Ange). On les appelle
 * en direct, avec la naissance, sans session AstroLearn : Vela n a pas de
 * personId, elle a une date/heure/lieu.
 *
 * Chaque appel a un delai. Un timeout n annule pas les autres : une annee de
 * profection maison 10 suffit deja a ne plus dire « rien sur le travail ».
 */

import { callCalculatorEndpoint } from "@/lib/astrolearn-calculator";
import { parseNatalHouseNumber, normalizeTransitCyclesPayload } from "@/lib/transit-cycle-passes";
import {
  anneesAvantMaison,
  eclipseToucheAxe,
  maisonsEtAxe,
  maisonsPourTopics,
  maisonMensuelle,
  moisAvantMaisonMensuelle,
  numeroFavorable,
  positionDansLesPassages,
  seigneurDuSigne,
  signeDeMaison,
  transitToucheMaisons,
  normaliserPointNatal,
  SIGNES,
  type TopicMaison,
} from "@/lib/astrologue-domaine";

export interface NaissancePourDossier {
  birthDate: string;
  birthTime: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const TOCTOC_BASE = "https://ai.zebrapad.io/full-suite-spiritual-api";

export type TechniqueNom =
  | "transit"
  | "profection"
  | "zr"
  | "eclipse"
  | "periodes"
  | "numerologie";

export interface FaitTechnique {
  technique: TechniqueNom;
  pertinent: boolean;
  resume: string;
  debut?: string;
  fin?: string;
  prochain?: string;
}

export interface DossierDomaine {
  maisonDemandee: number;
  maisons: number[];
  domaine: TopicMaison;
  faits: FaitTechnique[];
  fenetre: { debut: string; fin: string; force: number; approximee: boolean } | null;
}

const DELAI = {
  profection: 15_000,
  transits: 28_000,
  zr: 28_000,
  periodes: 12_000,
  numerologie: 12_000,
  eclipses: 8_000,
} as const;

function isoJour(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  if (typeof d === "string") {
    const m = d.match(/^(\d{4}-\d{2}-\d{2})/);
    return m ? m[1] : null;
  }
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

function ajouterMois(iso: string, mois: number): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + mois, day));
  return d.toISOString().slice(0, 10);
}

function ajouterAnnees(iso: string, annees: number): string {
  const [y, m, day] = iso.split("-").map(Number);
  const d = new Date(Date.UTC(y + annees, m - 1, day));
  return d.toISOString().slice(0, 10);
}

function rec(v: unknown): Record<string, unknown> | null {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function unwrap(payload: unknown): Record<string, unknown> | null {
  const root = rec(payload);
  if (!root) return null;
  return rec(root.data) ?? root;
}

async function avecDelai<T>(p: Promise<T>, ms: number): Promise<T | null> {
  let t: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    t = setTimeout(() => resolve(null), ms);
  });
  try {
    return await Promise.race([p, timeout]);
  } catch (err) {
    console.error("[astrologue-techniques] appel echoue:", err);
    return null;
  } finally {
    if (t) clearTimeout(t);
  }
}

function payloadNaissance(
  birth: NaissancePourDossier,
  extra: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    birthDate: birth.birthDate,
    birthTime: birth.birthTime,
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
    ...extra,
  };
}

async function appellerCalculateur(
  endpoint: string,
  input: Record<string, unknown>,
  delai: number,
): Promise<unknown | null> {
  return avecDelai(callCalculatorEndpoint(endpoint, input), delai);
}

// ── Profection ───────────────────────────────────────────────────────────────

interface NatalLu {
  maisons: Record<string, number>;
  signes: Record<string, string>;
}

function lireNatal(chart: Record<string, unknown> | null): NatalLu {
  const maisons: Record<string, number> = {};
  const signes: Record<string, string> = {};
  const planets = rec(chart?.planets);
  if (planets) {
    for (const [brut, val] of Object.entries(planets)) {
      const nom = normaliserPointNatal(brut) ?? brut;
      const o = rec(val);
      const h = num(o?.house);
      const s = str(o?.sign);
      if (h && h >= 1 && h <= 12) maisons[nom] = h;
      if (s) signes[nom] = s;
    }
  }
  if (maisons.MC == null) maisons.MC = 10;
  if (maisons.IC == null) maisons.IC = 4;
  return { maisons, signes };
}

function extraireProfection(
  payload: unknown,
  maisonsCibles: number[],
  aujourdhui: string,
): { faits: FaitTechnique[]; natal: NatalLu; seigneurDomaine: string | null } {
  const faits: FaitTechnique[] = [];
  const data = unwrap(payload);
  const bloc = rec(data?.profection) ?? data;
  if (!bloc) return { faits, natal: { maisons: {}, signes: {} }, seigneurDomaine: null };

  const annual = rec(bloc.annualProfection) ?? rec(bloc.currentYear);
  const monthly = rec(bloc.monthlyProfection);
  const bornes = rec(bloc.profectionYearBoundaries);
  const natalChart = rec(bloc.natalChartComplete);
  const natal = lireNatal(natalChart);
  const ascLon =
    num(rec(bloc.natalAscendant)?.longitude) ??
    num(rec(natalChart?.ascendant)?.longitude) ??
    num(natalChart?.ascendant);
  if (typeof ascLon === "number" && !natal.signes.MC) {
    const ascSigneIdx = Math.floor(((ascLon % 360) + 360) % 360 / 30);
    natal.signes.MC = SIGNES[(ascSigneIdx + 9) % 12];
    natal.signes.Ascendant = SIGNES[ascSigneIdx];
  }

  const maisonAnnuelle = num(annual?.house) ?? num(bloc.activatedHouse);
  const signeAnnuel = str(annual?.sign) ?? str(bloc.sign);
  const seigneurAnnee = str(annual?.ruler) ?? str(bloc.lord);
  const debutAnnee = isoJour(str(bornes?.startDate)) ?? aujourdhui;
  const finAnnee = isoJour(str(bornes?.endDate));
  const moisDepuis = num(bloc.monthsSinceBirthday) ?? 0;

  const dansLaMaisonAnnuelle = Array.isArray(annual?.planetsInHouse)
    ? (annual.planetsInHouse as unknown[]).map((p) => {
        if (typeof p === "string") return p;
        const o = rec(p);
        return str(o?.planet) ?? str(o?.name) ?? "";
      }).filter(Boolean)
    : [];
  if (maisonAnnuelle) {
    for (const p of dansLaMaisonAnnuelle) {
      const nom = normaliserPointNatal(p) ?? p;
      if (natal.maisons[nom] == null) natal.maisons[nom] = maisonAnnuelle;
    }
  }
  if (maisonAnnuelle === 10 && signeAnnuel && !natal.signes.MC) {
    natal.signes.MC = signeAnnuel;
  }

  const seigneursCibles = new Set<string>();
  for (const h of maisonsCibles) {
    const signe =
      h === 10 && natal.signes.MC
        ? natal.signes.MC
        : signeDeMaison(h, maisonAnnuelle ?? 1, signeAnnuel ?? "") ?? null;
    const seigneur = seigneurDuSigne(signe);
    if (seigneur) seigneursCibles.add(seigneur);
  }
  const seigneurDomaine =
    (maisonsCibles.includes(10)
      ? seigneurDuSigne(natal.signes.MC) ?? seigneurDuSigne(signeDeMaison(10, maisonAnnuelle ?? 1, signeAnnuel ?? ""))
      : null) ??
    [...seigneursCibles][0] ??
    seigneurDuSigne(signeAnnuel);

  if (maisonAnnuelle) {
    const dansLeDomaine = maisonsCibles.includes(maisonAnnuelle);
    const seigneurEstCeluiDuDomaine =
      !!seigneurAnnee && [...seigneursCibles].some((s) => s.toLowerCase() === seigneurAnnee.toLowerCase());
    const pertinent = dansLeDomaine || seigneurEstCeluiDuDomaine;

    let resume: string;
    if (dansLeDomaine) {
      resume = `Profection annuelle : la maison du domaine demande est celle de cette annee (${debutAnnee} → ${finAnnee ?? "anniversaire suivant"}). C'est l'annee ou ce domaine est mis en avant.`;
    } else if (seigneurEstCeluiDuDomaine) {
      resume = `Profection annuelle : le seigneur du domaine demande gouverne aussi cette annee (maison annuelle ${maisonAnnuelle}, seigneur ${seigneurAnnee}, ${debutAnnee} → ${finAnnee ?? "anniversaire suivant"}).`;
    } else {
      const plusProche = maisonsCibles
        .map((h) => ({ h, n: anneesAvantMaison(maisonAnnuelle, h) }))
        .sort((a, b) => a.n - b.n)[0];
      const quand = plusProche ? ajouterAnnees(debutAnnee, plusProche.n) : null;
      resume = `Profection annuelle : cette annee n'est PAS la maison du domaine (maison ${maisonAnnuelle}). Prochaine annee ou ce domaine est annuel : dans ${plusProche?.n ?? "?"} an (${quand ?? "?"}).`;
    }

    const maisonDuMois = monthly
      ? num(monthly.house)
      : maisonAnnuelle
        ? maisonMensuelle(maisonAnnuelle, moisDepuis)
        : null;
    if (maisonDuMois && maisonsCibles.includes(maisonDuMois)) {
      resume += ` La profection du mois en cours tombe aussi sur ce domaine.`;
    } else if (maisonAnnuelle) {
      const dMois = moisAvantMaisonMensuelle(maisonAnnuelle, maisonsCibles[0]);
      if (dMois > 0) {
        const dateMois = ajouterMois(debutAnnee, dMois);
        resume += ` Prochain mois ou la profection mensuelle retombe sur ce domaine : ${dateMois}.`;
      }
    }

      const nAns = anneesAvantMaison(maisonAnnuelle, maisonsCibles[0]);
      const prochainHorsAnnee = nAns >= 0 ? ajouterAnnees(debutAnnee, nAns) : undefined;
      faits.push({
      technique: "profection",
      pertinent,
      resume,
      debut: debutAnnee,
      fin: finAnnee ?? undefined,
      prochain: dansLeDomaine ? finAnnee ?? undefined : prochainHorsAnnee,
    });
  }

  return { faits, natal, seigneurDomaine: seigneurDomaine ?? null };
}

// ── Transits (transit-cycles, l ecran Transits de l outil) ───────────────────

function extraireCycles(payload: unknown): Array<Record<string, unknown>> {
  const normalise = normalizeTransitCyclesPayload(payload);
  if (Array.isArray(normalise)) {
    return normalise.filter((c): c is Record<string, unknown> => rec(c) !== null);
  }
  const data = rec(normalise)?.data;
  if (Array.isArray(data)) {
    return data.filter((c): c is Record<string, unknown> => rec(c) !== null);
  }
  return [];
}

function extraireTransits(
  payload: unknown,
  maisonsCibles: number[],
  natalMaisons: Record<string, number>,
  aujourdhui: string,
): FaitTechnique[] {
  const faits: FaitTechnique[] = [];
  const cycles = extraireCycles(payload);

  for (const c of cycles) {
    const debut = isoJour(str(c.firstHit));
    const fin = isoJour(str(c.lastHit));
    const status = str(c.status);
    const actif =
      (debut && fin && debut <= aujourdhui && aujourdhui <= fin) ||
      status === "active" ||
      c.isInMiddleOfCycle === true;
    const aVenir = debut && debut > aujourdhui && debut <= ajouterMois(aujourdhui, 18);
    if (!actif && !aVenir) continue;

    const natalPoint = str(c.natalPoint);
    const houseInfo = rec(c.houseTransitInfo);
    const houseTransitNumber =
      num(houseInfo?.houseNumber) ?? parseNatalHouseNumber(natalPoint ?? undefined);
    const pointCanon = normaliserPointNatal(natalPoint);
    const natalHouseDuPoint =
      (pointCanon ? natalMaisons[pointCanon] : undefined) ??
      (natalPoint ? natalMaisons[natalPoint] : undefined) ??
      null;

    if (!transitToucheMaisons({
      natalPoint,
      natalHouseDuPoint,
      houseTransitNumber,
      maisons: maisonsCibles,
    })) {
      continue;
    }

    const periods = Array.isArray(c.periods) ? c.periods : [];
    const passages = periods
      .map((p) => {
        const period = rec(p);
        const best = rec(period?.bestHit);
        return isoJour(str(best?.date) ?? str(period?.startDate));
      })
      .filter((d): d is string => !!d);
    const pos = positionDansLesPassages(aujourdhui, passages);
    const transitPlanet = str(c.transitPlanet) ?? "une planete lente";
    const aspect = str(c.aspect) ?? "aspect";
    const nPass = passages.length || num(c.hitsCount) || 1;

    let ouOnEst = "";
    if (pos) {
      if (pos.apres === 0 && pos.prochain) ouOnEst = ` Le premier passage est le ${pos.prochain}.`;
      else if (pos.avant === null) ouOnEst = ` Le dernier passage est passe.`;
      else ouOnEst = ` On est entre le ${pos.apres}e et le ${pos.avant}e passage. Prochain : ${pos.prochain}.`;
    }

    const nature =
      /square|opposition/i.test(aspect) ? "en tension avec"
      : /trine|sextile|conjunction/i.test(aspect) ? "en lien avec"
      : "en contact avec";
    const pointDit = natalHouseDuPoint
      ? `le point ${pointCanon ?? natalPoint} de ce domaine`
      : `${pointCanon ?? natalPoint}`;

    faits.push({
      technique: "transit",
      pertinent: true,
      resume: `Cycle lent actuel : ${transitPlanet} ${nature} ${pointDit}. Fenetre ${debut ?? "?"} → ${fin ?? "?"}, ${nPass} passage(s).${ouOnEst} A integrer a l'explication du domaine.`,
      debut: debut ?? undefined,
      fin: fin ?? undefined,
      prochain: pos?.prochain ?? fin ?? undefined,
    });
  }

  return faits;
}

// ── ZR Lot of Spirit ─────────────────────────────────────────────────────────

interface PeriodeZr {
  startDate?: string;
  endDate?: string;
  isPeakPeriod?: boolean;
  isCulmination?: boolean;
  isLoosingOfBond?: boolean;
  housePlacement?: unknown;
  subPeriods?: PeriodeZr[];
  markers?: string[];
}

function estPic(p: PeriodeZr | null | undefined): boolean {
  if (!p) return false;
  if (p.isPeakPeriod === true) return true;
  const markers = p.markers ?? [];
  return markers.some((m) => /^p$/i.test(m) || /peak/i.test(m));
}

function estCulmination(p: PeriodeZr | null | undefined): boolean {
  if (!p) return false;
  if (p.isCulmination === true) return true;
  const markers = p.markers ?? [];
  return markers.some((m) => m === "Cu" || /culmin/i.test(m));
}

function maisonDePeriode(p: PeriodeZr): number | null {
  const hp = p.housePlacement;
  if (typeof hp === "number") return hp;
  const o = rec(hp);
  return num(o?.house);
}

function extraireZr(
  payload: unknown,
  maisonsCibles: number[],
  aujourdhui: string,
): FaitTechnique[] {
  const data = unwrap(payload);
  const releasing = rec(data?.releasing) ?? data;
  if (!releasing) return [];

  const current = rec(releasing.currentPeriods) ?? {};
  const l2 = rec(current.L2) as PeriodeZr | null;
  const l3 = rec(current.L3) as PeriodeZr | null;
  const periods = Array.isArray(releasing.periods) ? (releasing.periods as PeriodeZr[]) : [];

  const l3Pic = estPic(l3);
  const l2Pic = estPic(l2);
  const l3Debut = isoJour(str(l3?.startDate));
  const l3Fin = isoJour(str(l3?.endDate));
  const l2Debut = isoJour(str(l2?.startDate));
  const l2Fin = isoJour(str(l2?.endDate));

  let prochainPicL2: { debut: string; fin: string | null } | null = null;
  for (const l1 of periods) {
    for (const sub of l1.subPeriods ?? []) {
      const d = isoJour(str(sub.startDate));
      if ((estPic(sub) || sub.isPeakPeriod) && d && d > aujourdhui) {
        prochainPicL2 = { debut: d, fin: isoJour(str(sub.endDate)) };
        break;
      }
    }
    if (prochainPicL2) break;
  }

  const maisonL2 = l2 ? maisonDePeriode(l2) : null;
  const maisonL3 = l3 ? maisonDePeriode(l3) : null;
  const toucheMaison =
    (maisonL2 != null && maisonsCibles.includes(maisonL2)) ||
    (maisonL3 != null && maisonsCibles.includes(maisonL3));

  const pertinent = l3Pic || l2Pic || estCulmination(l2) || estCulmination(l3) || toucheMaison || !!prochainPicL2;
  if (!l2 && !l3) return [];

  const lignes: string[] = [];
  if (l3Pic) {
    const recent = l3Debut && (new Date(`${aujourdhui}T00:00:00Z`).getTime() - new Date(`${l3Debut}T00:00:00Z`).getTime()) / 86_400_000 < 45;
    lignes.push(
      `ZR Lot de l'Esprit, niveau fin (L3) : phase de PIC ${recent ? "vient de s'ouvrir" : "en cours"} (${l3Debut ?? "?"} → ${l3Fin ?? "?"}). C'est un chapitre ou les choses du domaine s'intensifient — a croiser avec le reste.`,
    );
  } else if (l3) {
    lignes.push(`ZR L3 en cours (${l3Debut ?? "?"} → ${l3Fin ?? "?"}), pas un pic.`);
  }
  if (l2Pic || estCulmination(l2)) {
    lignes.push(`ZR L2 (chapitre plus large) est ${l2Pic ? "AUSSI en pic" : "en culmination"} (${l2Debut ?? "?"} → ${l2Fin ?? "?"}).`);
  } else if (prochainPicL2) {
    lignes.push(`ZR L2 : le prochain pic de ce niveau s'ouvre le ${prochainPicL2.debut}${prochainPicL2.fin ? ` (jusqu'au ${prochainPicL2.fin})` : ""}.`);
  }
  if (toucheMaison) {
    lignes.push(`Le chapitre ZR en cours touche aussi la maison du domaine (L2 maison ${maisonL2 ?? "—"}, L3 maison ${maisonL3 ?? "—"}).`);
  }

  if (lignes.length === 0) return [];

  return [{
    technique: "zr",
    pertinent,
    resume: lignes.join(" "),
    debut: l3Debut ?? l2Debut ?? undefined,
    fin: l3Fin ?? l2Fin ?? undefined,
    prochain: prochainPicL2?.debut ?? l3Fin ?? undefined,
  }];
}

// ── Eclipses (daily-briefing-context, deja rapide) ───────────────────────────

function extraireEclipses(
  payload: unknown,
  maisonsAxe: number[],
): FaitTechnique[] {
  const data = unwrap(payload) ?? rec(payload);
  if (!data) return [];
  const eclipses = [
    ...(Array.isArray(data.activeEclipses) ? data.activeEclipses : []),
    ...(Array.isArray(data.eclipses) ? data.eclipses : []),
  ];
  const faits: FaitTechnique[] = [];

  for (const brut of eclipses) {
    const e = rec(brut);
    if (!e) continue;
    const housesRaw = e.eclipseHouses ?? e.houses ?? e.natalHouse;
    const houses: number[] = Array.isArray(housesRaw)
      ? housesRaw.map((h) => Number(h)).filter((n) => n >= 1 && n <= 12)
      : typeof housesRaw === "number"
        ? [housesRaw]
        : [];
    const axis = str(e.axis) ?? str(e.eclipseAxis) ?? (houses.length >= 2 ? `${houses[0]}-${houses[houses.length - 1]}` : null);
    if (!eclipseToucheAxe({ axis, houses, maisons: maisonsAxe })) continue;

    const date = isoJour(str(e.date) ?? str(e.startDate));
    const payloadTexte = str(e.llmPayload);
    faits.push({
      technique: "eclipse",
      pertinent: true,
      resume: `Rendez-vous rare sur l'axe du domaine (foyer / carrière pour une question travail)${date ? ` vers le ${date}` : ""}.${payloadTexte ? ` Detail moteur : ${payloadTexte}` : ""}`,
      debut: date ?? undefined,
      fin: date ?? undefined,
    });
  }
  return faits;
}

// ── Periodes planetaires (firdaria / ages-cles) ──────────────────────────────

function extrairePeriodes(
  payload: unknown,
  seigneurDomaine: string | null,
  aujourdhui: string,
): FaitTechnique[] {
  const data = unwrap(payload);
  if (!data || !seigneurDomaine) return [];

  const actif = rec(data.currentlyActive);
  const suivant = rec(data.nextMilestone);
  const tous = Array.isArray(data.allMilestones) ? data.allMilestones : [];

  const vise = seigneurDomaine.toLowerCase();
  const estCible = (o: Record<string, unknown> | null) =>
    !!o && str(o.planet)?.toLowerCase() === vise;

  const activations = tous
    .map((x) => rec(x))
    .filter((x): x is Record<string, unknown> => !!x && estCible(x));

  const actifEstCible = estCible(actif);
  const prochaineCible = activations
    .map((a) => ({ a, d: isoJour(str(a.activationDate)) }))
    .filter((x) => x.d && x.d >= aujourdhui)
    .sort((a, b) => (a.d ?? "").localeCompare(b.d ?? ""))[0];

  const pertinent = actifEstCible || !!prochaineCible;
  if (!pertinent && !actif) return [];

  const lignes: string[] = [];
  lignes.push(`Periodes planetaires : le seigneur du domaine (signe du milieu du ciel / maison visee) est ${seigneurDomaine}.`);
  if (actifEstCible) {
    lignes.push(`Il est le seigneur de periode ACTUEL (${str(actif?.period) ?? "periode"} depuis ${isoJour(str(actif?.activationDate)) ?? "?"}).`);
  } else if (actif) {
    lignes.push(`Seigneur actuel : ${str(actif.planet)} (${str(actif.period) ?? ""}). Ce n'est pas le seigneur du domaine.`);
  }
  if (prochaineCible) {
    lignes.push(`Prochaine activation de ${seigneurDomaine} : ${prochaineCible.d} (${str(prochaineCible.a.period) ?? "periode"}).`);
  }
  if (suivant && !prochaineCible) {
    const d = isoJour(str(suivant.activationDate));
    lignes.push(`Prochain jalon toutes planetes : ${str(suivant.planet)} le ${d ?? "?"}.`);
  }

  return [{
    technique: "periodes",
    pertinent,
    resume: lignes.join(" "),
    prochain: prochaineCible?.d ?? isoJour(str(suivant?.activationDate)) ?? undefined,
  }];
}

// ── Numerologie ──────────────────────────────────────────────────────────────

function extraireNumerologie(payload: unknown, aujourdhui: string): FaitTechnique[] {
  const data = unwrap(payload);
  if (!data) return [];
  const anneeActuelle = Number(aujourdhui.slice(0, 4));
  const moisActuel = Number(aujourdhui.slice(5, 7));
  const annees = Array.isArray(data.annees)
    ? data.annees
    : Array.isArray(data.hundredYearCycles)
      ? data.hundredYearCycles
      : Array.isArray(data.years)
        ? data.years
        : [];

  const deCetteAnnee = annees
    .map((x) => rec(x))
    .find((a) => a && (num(a.annee) ?? num(a.year)) === anneeActuelle);
  if (!deCetteAnnee) return [];

  const perso = num(deCetteAnnee.anneePersonnelle) ?? num(deCetteAnnee.personalYear);
  const theme = rec(deCetteAnnee.anneePersonnelleTheme) ?? rec(deCetteAnnee.personalYearTheme);
  const titre = str(theme?.title) ?? str(theme?.titre);
  const influence12 = deCetteAnnee.influence12 === true;

  const moisRaw = Array.isArray(deCetteAnnee.mois)
    ? deCetteAnnee.mois
    : Array.isArray(deCetteAnnee.months)
      ? deCetteAnnee.months
      : [];
  const moisFavorables = moisRaw
    .map((m) => rec(m))
    .filter((m): m is Record<string, unknown> => !!m)
    .filter((m) => {
      const n = num(m.moisPersonnel) ?? num(m.personalMonth);
      const mois = num(m.mois) ?? num(m.month);
      return numeroFavorable(n) && typeof mois === "number" && mois >= moisActuel;
    })
    .map((m) => {
      const mois = num(m.mois) ?? num(m.month);
      const n = num(m.moisPersonnel) ?? num(m.personalMonth);
      return `${String(mois).padStart(2, "0")}/${anneeActuelle} (mois personnel ${n})`;
    });

  const favorable = numeroFavorable(perso) || influence12 || moisFavorables.length > 0;
  const resume =
    `Numerologie : annee personnelle ${perso ?? "?"}${titre ? ` (« ${titre} »)` : ""}${influence12 ? ", annee d'influence 12" : ""}.` +
    (moisFavorables.length > 0
      ? ` Mois favorables restants cette annee : ${moisFavorables.slice(0, 4).join(", ")}.`
      : " Pas de mois personnel 1/5/8 restant cette annee.");

  return [{
    technique: "numerologie",
    pertinent: favorable,
    resume,
  }];
}

// ── Assemblage ───────────────────────────────────────────────────────────────

function fenetreDepuisFaits(faits: FaitTechnique[]): DossierDomaine["fenetre"] {
  const pertinents = faits.filter((f) => f.pertinent);
  const debuts = pertinents.map((f) => f.debut).filter((d): d is string => !!d).sort();
  const fins = pertinents.map((f) => f.fin).filter((d): d is string => !!d).sort();
  if (debuts.length === 0 || fins.length === 0) {
    const prochains = pertinents.map((f) => f.prochain).filter((d): d is string => !!d).sort();
    if (prochains.length === 0) return null;
    return {
      debut: prochains[0],
      fin: prochains[prochains.length - 1],
      force: pertinents.length,
      approximee: true,
    };
  }
  return {
    debut: debuts[0],
    fin: fins[fins.length - 1],
    force: pertinents.length,
    approximee: pertinents.some((f) => f.technique === "zr" || f.technique === "numerologie"),
  };
}

export async function constituerDossierDomaine(
  birthData: NaissancePourDossier,
  topics: TopicMaison[],
  options: { aujourdhui?: string; firstName?: string; lastName?: string } = {},
): Promise<DossierDomaine | null> {
  const maisons = maisonsPourTopics(topics);
  if (maisons.length === 0) return null;

  const aujourdhui = options.aujourdhui ?? new Date().toISOString().slice(0, 10);
  const axe = maisonsEtAxe(maisons);
  const naissance = payloadNaissance(birthData);
  const domaine = topics[0];

  const [profectionRaw, transitsRaw, zrRaw, periodesRaw, numerologieRaw, briefingRaw] =
    await Promise.all([
      appellerCalculateur("/api/profection", { ...naissance, targetDate: aujourdhui }, DELAI.profection),
      appellerCalculateur("/api/transit-cycles", { ...naissance, targetDate: aujourdhui }, DELAI.transits),
      appellerCalculateur(
        "/api/zodiacal-releasing",
        { ...naissance, lotType: "spirit", maxLevels: 3, targetDate: aujourdhui },
        DELAI.zr,
      ),
      appellerCalculateur(
        "/api/planetary-periods",
        { ...naissance, referenceDate: aujourdhui },
        DELAI.periodes,
      ),
      options.firstName || options.lastName
        ? appellerCalculateur(
            "/api/numerology-timing",
            payloadNaissance(birthData, {
              firstName: options.firstName ?? "",
              lastName: options.lastName ?? "",
            }),
            DELAI.numerologie,
          )
        : Promise.resolve(null),
      avecDelai(
        fetch(`${TOCTOC_BASE}/daily-briefing-context.php`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(naissance),
        }).then(async (res) => (res.ok ? res.json() : null)),
        DELAI.eclipses,
      ),
    ]);

  const prof = extraireProfection(profectionRaw, maisons, aujourdhui);
  const transits = extraireTransits(transitsRaw, maisons, prof.natal.maisons, aujourdhui);
  const zr = extraireZr(zrRaw, maisons, aujourdhui);
  const eclipses = extraireEclipses(briefingRaw, axe);
  const periodes = extrairePeriodes(periodesRaw, prof.seigneurDomaine, aujourdhui);
  const numerologie = extraireNumerologie(numerologieRaw, aujourdhui);

  const faits = [...prof.faits, ...transits, ...zr, ...eclipses, ...periodes, ...numerologie];
  const pertinents = faits.filter((f) => f.pertinent);

  console.log("[astrologue-techniques] dossier", {
    domaine,
    maisons,
    techniques: faits.map((f) => `${f.technique}:${f.pertinent ? "oui" : "non"}`),
    nPertinents: pertinents.length,
  });

  if (faits.length === 0) return null;

  return {
    maisonDemandee: maisons[0],
    maisons,
    domaine,
    faits,
    fenetre: fenetreDepuisFaits(faits),
  };
}
