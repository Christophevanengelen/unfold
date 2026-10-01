/**
 * Comparatif : tous les produits dans une seule vue.
 *
 * Ce qu'on peut classer aujourd'hui : l'entree (personnes qui arrivent),
 * l'activation (part qui atteint le geste de valeur) et la retention a une
 * semaine. Le revenu n'est PAS encore branche : il vient de RevenueCat et des
 * stores, dont l'acces est demande a Marie-Ange. Tant qu'il manque, aucun
 * classement « qui rapporte le plus » n'est affiche, et la page le dit.
 *
 * Les produits ne sont classes qu'au sein de leur famille (apps entre elles,
 * sites entre eux). Aucun seuil de « bon » n'est invente : rang 1 = meilleur
 * parmi ses pairs, nombre brut d'abord, rien du tout sous 30 personnes.
 */

import Link from "next/link";
import { getAdminClient } from "@/lib/db";
import { PRODUITS_DEMO, donneesDemo } from "@/lib/kpi-demo";
import { lire as lireEchantillon, formaterPart, SEUIL_LECTURE, type Lecture } from "@/lib/kpi-stats";
import { rangs, moyenneDesRangs } from "@/lib/kpi-score";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Famille = "app" | "landing" | "imprime";
type Produit = { app_id: string; nom: string; famille: Famille };
type Etape = { rang: number; etape: string; installations: number };
type Cohorte = { cohorte: string; taille: number; semaine: number; actifs: number };
type Fraicheur = { app_id: string; derniere: string | null };

const ETAPES: Record<Famille, string[]> = {
  app: ["app_ouverte", "onboarding_demarre", "onboarding_termine", "premier_signal_vu", "signal_ouvert"],
  landing: ["page_vue", "cta_clic"],
  imprime: ["qr_scanne"],
};
const TITRES_FAMILLE: Record<Famille, string> = { app: "Apps", landing: "Sites et landings", imprime: "Imprimé" };
const PERIODES = [7, 30, 90] as const;

type Ligne = {
  produit: Produit;
  entrants: number;
  activation: Lecture | null;
  retention: Lecture | null;
  heures: number | null;
};

async function lireLigne(p: Produit, jours: number, demo: boolean, indexDemo: number): Promise<Ligne> {
  const e = ETAPES[p.famille];
  let entonnoir: Etape[];
  let cohortes: Cohorte[];
  let derniere: string | null;

  if (demo) {
    const d = donneesDemo(p.famille, indexDemo);
    entonnoir = d.entonnoir;
    cohortes = d.cohortes;
    derniere = d.fraicheur?.derniere ?? null;
  } else {
    const supabase = getAdminClient();
    const depuis = new Date(Date.now() - jours * 864e5).toISOString();
    const [ent, coh, fra] = await Promise.all([
      e.length > 1 ? supabase.rpc("kpi_entonnoir", { p_app: p.app_id, p_etapes: e, p_depuis: depuis }) : Promise.resolve({ data: [] }),
      p.famille === "app" ? supabase.rpc("kpi_cohortes", { p_app: p.app_id, p_semaines: 8 }) : Promise.resolve({ data: [] }),
      supabase.rpc("kpi_fraicheur"),
    ]);
    entonnoir = (ent.data ?? []) as Etape[];
    cohortes = (coh.data ?? []) as Cohorte[];
    derniere = ((fra.data ?? []) as Fraicheur[]).find((f) => f.app_id === p.app_id)?.derniere ?? null;

    if (p.famille === "imprime") {
      const { data } = await supabase.rpc("kpi_comptes", { p_app: p.app_id, p_depuis: depuis });
      const scans = ((data ?? []) as { event: string; installations: number }[]).find((c) => c.event === "qr_scanne");
      entonnoir = [{ rang: 1, etape: "qr_scanne", installations: scans?.installations ?? 0 }];
    }
  }

  const entrants = entonnoir[0]?.installations ?? 0;

  let activation: Lecture | null = null;
  if (p.famille === "app" && demo && entonnoir.length >= 4) activation = lireEchantillon(entonnoir[3].installations, entrants);
  if (p.famille === "app" && !demo) {
    // Borne basse du nombre de personnes ayant recu de la valeur : le plus grand
    // des comptes distincts parmi les evenements de valeur. On n'exige PAS
    // qu'elles aient franchi toutes les etapes dans l'ordre sur la periode :
    // certains evenements ne partent qu'une fois par installation, donc un
    // entonnoir strict sous-estimerait l'activation des gens deja installes.
    const depuis = new Date(Date.now() - jours * 864e5).toISOString();
    const { data } = await getAdminClient().rpc("kpi_comptes", { p_app: p.app_id, p_depuis: depuis });
    const valeur = ((data ?? []) as { event: string; installations: number }[])
      .filter((c) => ["premier_signal_vu", "signal_ouvert", "valeur_recue"].includes(c.event))
      .reduce((m, c) => Math.max(m, c.installations), 0);
    activation = lireEchantillon(Math.min(valeur, entrants), entrants);
  }
  if (p.famille === "landing" && entonnoir.length >= 2) activation = lireEchantillon(entonnoir[1].installations, entrants);

  // Retention a une semaine : sur les cohortes assez anciennes pour avoir une semaine +1.
  let retention: Lecture | null = null;
  if (p.famille === "app") {
    const avecS1 = cohortes.filter((c) => c.semaine === 1);
    const taille = avecS1.reduce((s, c) => s + c.taille, 0);
    const actifs = avecS1.reduce((s, c) => s + c.actifs, 0);
    retention = lireEchantillon(actifs, taille);
  }

  const heures = derniere ? Math.floor((Date.now() - new Date(derniere).getTime()) / 36e5) : null;
  return { produit: p, entrants, activation, retention, heures };
}

function valeurLisible(l: Lecture | null): number | null {
  return l && l.etat === "lisible" ? l.part : null;
}

function Cellule({ l, rang }: { l: Lecture | null; rang: number | null }) {
  if (!l) return <span className="text-text-body-subtle">sans objet</span>;
  if (l.etat === "insuffisant") {
    return (
      <span className="text-text-body-subtle">
        {l.k} sur {l.n} <span className="text-xs">(sous {SEUIL_LECTURE})</span>
      </span>
    );
  }
  return (
    <span>
      <span className="font-semibold text-text-heading">{formaterPart(l)}</span>{" "}
      <span className="text-xs text-text-body-subtle">
        {l.k} sur {l.n}
      </span>
      {rang !== null && <span className="ml-2 rounded-full border border-border-light px-2 py-0.5 text-xs">#{rang}</span>}
    </span>
  );
}

export default async function ComparatifPage({ searchParams }: { searchParams: Promise<{ jours?: string; demo?: string }> }) {
  const params = await searchParams;
  const demo = params.demo === "1";
  const jours = (PERIODES as readonly number[]).includes(Number(params.jours)) ? Number(params.jours) : 30;
  const suffixe = demo ? "&demo=1" : "";

  let produits: Produit[] = PRODUITS_DEMO;
  if (!demo) {
    try {
      const { data } = await getAdminClient().from("mesure_produits").select("app_id, nom, famille").eq("actif", true).order("app_id");
      produits = (data as Produit[] | null) ?? [];
    } catch {
      produits = [];
    }
  }

  const lignes = await Promise.all(produits.map((p, i) => lireLigne(p, jours, demo, i)));
  const familles = (Object.keys(TITRES_FAMILLE) as Famille[]).filter((f) => lignes.some((l) => l.produit.famille === f));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">Comparatif des produits</h1>
      <p className="mt-2 text-text-body-subtle">
        Tous les produits dans une seule vue. Rang 1 = meilleur parmi les produits de la même famille. Aucun seuil de « bon »
        n&apos;est inventé : on compare les produits entre eux, avec le nombre brut d&apos;abord.
      </p>

      {demo && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-text-heading p-4 text-sm font-semibold text-text-heading" role="note">
          DONNÉES D&apos;EXEMPLE — rien de ceci n&apos;est mesuré. Les vrais chiffres apparaissent sans « ?demo=1 ».
        </div>
      )}

      <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm" aria-label="Période">
        <Link href={`/admin/kpi?jours=${jours}${suffixe}`} className="rounded-full border border-border-light px-3 py-1 text-text-body-subtle">
          ← Un produit en détail
        </Link>
        <span className="mx-2 text-text-body-subtle">·</span>
        {PERIODES.map((j) => (
          <Link
            key={j}
            href={`?jours=${j}${suffixe}`}
            aria-current={j === jours ? "page" : undefined}
            className={`rounded-full border px-3 py-1 ${j === jours ? "border-text-heading font-semibold text-text-heading" : "border-border-light text-text-body-subtle"}`}
          >
            {j} jours
          </Link>
        ))}
      </nav>

      <section className="mt-6 rounded-xl border border-border-light bg-bg-secondary p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-body-subtle">Qui génère le plus d&apos;argent ?</p>
        <p className="mt-2 text-text-heading">
          Non branché. Le revenu vient de RevenueCat et des consoles App Store et Google Play : l&apos;accès est demandé à
          Marie-Ange. Tant qu&apos;il manque, aucun classement de revenu n&apos;est affiché, plutôt qu&apos;un zéro trompeur.
        </p>
      </section>

      {familles.map((famille) => {
        const dans = lignes.filter((l) => l.produit.famille === famille);
        const rEntrants = rangs(dans.map((l) => (l.entrants >= SEUIL_LECTURE ? l.entrants : null)));
        const rActivation = rangs(dans.map((l) => valeurLisible(l.activation)));
        const rRetention = rangs(dans.map((l) => valeurLisible(l.retention)));
        const moyennes = dans.map((_, i) => moyenneDesRangs([rEntrants[i], rActivation[i], rRetention[i]]));
        const comparables = moyennes.filter((m) => m !== null).length >= 2;
        const ordre = dans.map((_, i) => i).sort((a, b) => (moyennes[a] ?? 99) - (moyennes[b] ?? 99));

        return (
          <section key={famille} className="mt-10">
            <h2 className="font-display text-xl font-bold text-text-heading">{TITRES_FAMILLE[famille]}</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-body-subtle">
                    <th className="py-2 pr-4 font-semibold">Produit</th>
                    <th className="py-2 pr-4 font-semibold">{famille === "landing" ? "Visiteurs" : famille === "imprime" ? "Scans" : "Entrées"}</th>
                    <th className="py-2 pr-4 font-semibold">{famille === "landing" ? "Cliquent" : "Reçoivent de la valeur"}</th>
                    <th className="py-2 pr-4 font-semibold">Reviennent à 1 semaine</th>
                    <th className="py-2 pr-4 font-semibold">Revenu</th>
                    <th className="py-2 pr-4 font-semibold">Suivi</th>
                    <th className="py-2 font-semibold">Rang moyen</th>
                  </tr>
                </thead>
                <tbody>
                  {ordre.map((i) => {
                    const l = dans[i];
                    return (
                      <tr key={l.produit.app_id} className="border-t border-border-light align-top">
                        <td className="py-3 pr-4 font-medium text-text-heading">
                          <Link href={`/admin/kpi?app=${l.produit.app_id}&jours=${jours}${suffixe}`} className="underline-offset-2 hover:underline">
                            {l.produit.nom}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          {l.entrants < SEUIL_LECTURE ? (
                            <span className="text-text-body-subtle">
                              {l.entrants} <span className="text-xs">(sous {SEUIL_LECTURE})</span>
                            </span>
                          ) : (
                            <span>
                              <span className="font-semibold text-text-heading">{l.entrants}</span>
                              {rEntrants[i] !== null && <span className="ml-2 rounded-full border border-border-light px-2 py-0.5 text-xs">#{rEntrants[i]}</span>}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <Cellule l={l.activation} rang={rActivation[i]} />
                        </td>
                        <td className="py-3 pr-4">
                          <Cellule l={l.retention} rang={rRetention[i]} />
                        </td>
                        <td className="py-3 pr-4 text-text-body-subtle">non branché</td>
                        <td className="py-3 pr-4 text-xs text-text-body-subtle">
                          {l.heures === null ? "aucune donnée reçue" : l.heures < 1 ? "il y a moins d'1 h" : `il y a ${l.heures} h`}
                        </td>
                        <td className="py-3">
                          {comparables && moyennes[i] !== null ? (
                            <span className="font-display text-xl font-bold text-text-heading">{moyennes[i]!.toFixed(1)}</span>
                          ) : (
                            <span className="text-text-body-subtle">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 text-xs text-text-body-subtle">
              {comparables
                ? "Rang moyen : moyenne des rangs sur les critères lisibles (1 = meilleur). Plus il est bas, mieux le produit se place parmi ses pairs."
                : `Pas de classement : il faut au moins deux produits de cette famille avec au moins deux critères lisibles (${SEUIL_LECTURE} personnes minimum par critère).`}
            </p>
          </section>
        );
      })}

      <p className="mt-8 text-xs text-text-body-subtle">
        Un produit sans donnée n&apos;est pas un mauvais produit : son suivi n&apos;est peut-être pas encore installé. Colonne
        « Suivi » : l&apos;heure de la dernière donnée reçue. Aucune donnée personnelle n&apos;entre ici.
      </p>
    </div>
  );
}
