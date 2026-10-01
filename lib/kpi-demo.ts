/**
 * Données d'EXEMPLE pour visualiser le tableau de bord avant que les vrais
 * chiffres n'arrivent. Rien ici n'est mesuré : la page l'affiche en toutes
 * lettres (bandeau « DONNÉES D'EXEMPLE »). Activé seulement par ?demo=1, donc
 * derrière le mot de passe de /admin.
 */

type Famille = "app" | "landing" | "imprime";

export const PRODUITS_DEMO: { app_id: string; nom: string; famille: Famille }[] = [
  { app_id: "unfold", nom: "Favorable (app)", famille: "app" },
  { app_id: "astrolearn", nom: "AstroLearn (app)", famille: "app" },
  { app_id: "astrolearn-site", nom: "Site AstroLearn", famille: "landing" },
  { app_id: "agenda2027", nom: "Agenda 2027", famille: "imprime" },
];

function lundi(semainesEnArriere: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) - semainesEnArriere * 7);
  return d.toISOString().slice(0, 10);
}

/** Un echelonnement par produit pour que l'exemple ne montre pas quatre copies identiques. */
function echelle(n: number, graine: number): number {
  return Math.max(1, Math.round(n * (1 - 0.17 * graine) + graine * 3));
}

function varier<T extends { installations?: number; actifs?: number; taille?: number }>(rows: T[], graine: number): T[] {
  if (graine === 0) return rows;
  return rows.map((r) => ({
    ...r,
    ...(r.installations !== undefined ? { installations: echelle(r.installations, graine) } : {}),
    ...(r.taille !== undefined ? { taille: echelle(r.taille, graine) } : {}),
    ...(r.actifs !== undefined ? { actifs: echelle(r.actifs, graine) } : {}),
  }));
}

export function donneesDemo(famille: Famille, graine = 0) {
  const d = donneesDemoBrutes(famille);
  return { ...d, entonnoir: varier(d.entonnoir, graine), cohortes: varier(d.cohortes, graine) };
}

function donneesDemoBrutes(famille: Famille) {
  if (famille === "landing") {
    return {
      comptes: [
        { event: "page_vue", evenements: 1840, installations: 1210, evenements_7j: 410, installations_7j: 290 },
        { event: "cta_clic", evenements: 236, installations: 198, evenements_7j: 52, installations_7j: 44 },
      ],
      entonnoir: [
        { rang: 1, etape: "page_vue", installations: 1210 },
        { rang: 2, etape: "cta_clic", installations: 198 },
      ],
      cohortes: [],
      sources: [
        { source: "direct", visiteurs: 520, cliqueurs: 71 },
        { source: "instagram", visiteurs: 310, cliqueurs: 58 },
        { source: "google", visiteurs: 240, cliqueurs: 41 },
        { source: "qr", visiteurs: 98, cliqueurs: 22 },
        { source: "newsletter", visiteurs: 42, cliqueurs: 6 },
      ],
      fraicheur: { app_id: "astrolearn-site", derniere: new Date().toISOString(), evenements_24h: 63 },
      heures: 0,
      erreur: null,
    };
  }
  if (famille === "imprime") {
    return {
      comptes: [{ event: "qr_scanne", evenements: 164, installations: 164, evenements_7j: 31, installations_7j: 31 }],
      entonnoir: [{ rang: 1, etape: "qr_scanne", installations: 164 }],
      cohortes: [],
      sources: [],
      fraicheur: { app_id: "agenda2027", derniere: new Date().toISOString(), evenements_24h: 6 },
      heures: 1,
      erreur: null,
    };
  }
  const tailles = [58, 47, 52, 39, 44, 33];
  const taux = [1, 0.46, 0.34, 0.29, 0.26, 0.24, 0.22];
  const cohortes = tailles.flatMap((taille, i) => {
    const age = tailles.length - 1 - i;
    return Array.from({ length: age + 1 }, (_, k) => ({
      cohorte: lundi(age),
      taille,
      semaine: k,
      actifs: Math.round(taille * taux[k] * (0.92 + ((i * 7 + k * 3) % 5) / 30)),
    }));
  });
  return {
    comptes: [
      { event: "app_ouverte", evenements: 3920, installations: 412, evenements_7j: 980, installations_7j: 188 },
      { event: "onboarding_demarre", evenements: 388, installations: 388, evenements_7j: 91, installations_7j: 91 },
      { event: "onboarding_termine", evenements: 262, installations: 262, evenements_7j: 66, installations_7j: 66 },
      { event: "premier_signal_vu", evenements: 241, installations: 241, evenements_7j: 61, installations_7j: 61 },
      { event: "signal_ouvert", evenements: 1480, installations: 177, evenements_7j: 402, installations_7j: 84 },
    ],
    entonnoir: [
      { rang: 1, etape: "app_ouverte", installations: 412 },
      { rang: 2, etape: "onboarding_demarre", installations: 388 },
      { rang: 3, etape: "onboarding_termine", installations: 262 },
      { rang: 4, etape: "premier_signal_vu", installations: 241 },
      { rang: 5, etape: "signal_ouvert", installations: 177 },
    ],
    cohortes,
    sources: [],
    fraicheur: { app_id: "unfold", derniere: new Date().toISOString(), evenements_24h: 214 },
    heures: 0,
    erreur: null,
  };
}
