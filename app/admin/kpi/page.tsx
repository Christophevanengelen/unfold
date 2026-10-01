/**
 * Les chiffres, produit par produit.
 *
 * Une phrase-verdict en tete, la preuve dessous, et la provenance de chaque
 * bloc : ici tout est « mesure » (evenements recus par /api/events ou compte
 * des scans de QR). Les sources reconstituees (base, console des stores)
 * s'ajouteront avec leur propre etiquette.
 *
 * Regles de lecture : le nombre brut d'abord, le pourcentage ensuite avec son
 * intervalle, rien du tout sous 30 personnes. Chaque produit se lit contre
 * lui-meme, jamais contre un autre.
 *
 * Composant serveur : lecture avec la cle de service, jamais depuis le
 * navigateur. L'acces est deja protege par mot de passe (middleware.ts).
 */

import Link from "next/link";
import { getAdminClient } from "@/lib/db";
import { PRODUITS_DEMO, donneesDemo } from "@/lib/kpi-demo";
import { lire as lireEchantillon, formaterPart, formaterIntervalle, SEUIL_LECTURE, type Lecture } from "@/lib/kpi-stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type Produit = { app_id: string; nom: string; famille: "app" | "landing" | "imprime" };
type Compte = { event: string; evenements: number; installations: number; evenements_7j: number; installations_7j: number };
type Etape = { rang: number; etape: string; installations: number };
type Cohorte = { cohorte: string; taille: number; semaine: number; actifs: number };
type Source = { source: string; visiteurs: number; cliqueurs: number };
type Fraicheur = { app_id: string; derniere: string | null; evenements_24h: number };

const PAR_DEFAUT: Produit[] = [{ app_id: "unfold", nom: "Favorable", famille: "app" }];

const ETAPES: Record<Produit["famille"], { cle: string; titre: string }[]> = {
  app: [
    { cle: "app_ouverte", titre: "Ouvre l'app" },
    { cle: "onboarding_demarre", titre: "Commence l'onboarding" },
    { cle: "onboarding_termine", titre: "Termine l'onboarding" },
    { cle: "premier_signal_vu", titre: "Voit un premier signal" },
    { cle: "signal_ouvert", titre: "Ouvre un signal" },
  ],
  landing: [
    { cle: "page_vue", titre: "Visite la page" },
    { cle: "cta_clic", titre: "Clique le bouton" },
  ],
  imprime: [{ cle: "qr_scanne", titre: "Scanne le QR" }],
};

const PERIODES = [7, 30, 90] as const;

async function lireTout(appId: string, famille: Produit["famille"], jours: number) {
  const supabase = getAdminClient();
  const depuis = new Date(Date.now() - jours * 864e5).toISOString();
  const etapes = ETAPES[famille].map((e) => e.cle);

  const [comptes, entonnoir, cohortes, sources, fraicheur] = await Promise.all([
    supabase.rpc("kpi_comptes", { p_app: appId, p_depuis: depuis }),
    etapes.length > 1
      ? supabase.rpc("kpi_entonnoir", { p_app: appId, p_etapes: etapes, p_depuis: depuis })
      : Promise.resolve({ data: [], error: null }),
    famille === "app" ? supabase.rpc("kpi_cohortes", { p_app: appId, p_semaines: 8 }) : Promise.resolve({ data: [], error: null }),
    famille === "landing" ? supabase.rpc("kpi_sources", { p_app: appId, p_depuis: depuis }) : Promise.resolve({ data: [], error: null }),
    supabase.rpc("kpi_fraicheur"),
  ]);

  const erreur = comptes.error?.message ?? entonnoir.error?.message ?? cohortes.error?.message ?? sources.error?.message ?? fraicheur.error?.message ?? null;

  const f = ((fraicheur.data ?? []) as Fraicheur[]).find((x) => x.app_id === appId) ?? null;
  const heures = f?.derniere ? Math.floor((Date.now() - new Date(f.derniere).getTime()) / 36e5) : null;

  return {
    comptes: (comptes.data ?? []) as Compte[],
    entonnoir: (entonnoir.data ?? []) as Etape[],
    cohortes: (cohortes.data ?? []) as Cohorte[],
    sources: (sources.data ?? []) as Source[],
    fraicheur: f,
    heures,
    erreur,
  };
}

async function lireProduits(): Promise<Produit[]> {
  try {
    const { data } = await getAdminClient().from("mesure_produits").select("app_id, nom, famille").eq("actif", true).order("app_id");
    if (!data || data.length === 0) return PAR_DEFAUT;
    // Favorable d'abord : c'est le produit qui a déjà des données, on ne veut
    // pas ouvrir le tableau sur un produit vide.
    return (data as Produit[]).sort((a, b) => Number(b.app_id === "unfold") - Number(a.app_id === "unfold"));
  } catch {
    return PAR_DEFAUT;
  }
}

/** La plus grosse perte entre deux etapes consecutives, si l'echantillon le permet. */
function verdict(etapes: Etape[], titres: { cle: string; titre: string }[]): string {
  if (etapes.length < 2 || etapes[0].installations < SEUIL_LECTURE) {
    const n = etapes[0]?.installations ?? 0;
    return `Pas encore assez de monde pour conclure : ${n} sur ${SEUIL_LECTURE} requis à la première étape.`;
  }
  let pire = { i: -1, perte: -1, de: 0, vers: 0 };
  for (let i = 1; i < etapes.length; i++) {
    const de = etapes[i - 1].installations;
    if (de < SEUIL_LECTURE) break;
    const vers = etapes[i].installations;
    const perte = de ? (de - vers) / de : 0;
    if (perte > pire.perte) pire = { i, perte, de, vers };
  }
  if (pire.i < 0) return "Pas assez de monde aux étapes suivantes pour désigner le goulot.";
  return `${pire.de - pire.vers} sur ${pire.de} s'arrêtent entre « ${titres[pire.i - 1].titre} » et « ${titres[pire.i].titre} » : c'est là que ça coince le plus.`;
}

function Mesure({ lecture }: { lecture: Lecture }) {
  return (
    <span>
      <span className="font-display text-2xl font-bold text-text-heading">
        {lecture.k} <span className="text-base font-normal text-text-body-subtle">sur {lecture.n}</span>
      </span>
      <span className="ml-3 text-sm text-text-body-subtle">
        {formaterPart(lecture)} · {formaterIntervalle(lecture)}
      </span>
    </span>
  );
}

export default async function KPIPage({ searchParams }: { searchParams: Promise<{ app?: string; jours?: string; demo?: string }> }) {
  const params = await searchParams;
  const demo = params.demo === "1";
  const produits = demo ? PRODUITS_DEMO : await lireProduits();
  const produit = produits.find((p) => p.app_id === params.app) ?? produits[0];
  const jours = (PERIODES as readonly number[]).includes(Number(params.jours)) ? Number(params.jours) : 30;
  const titres = ETAPES[produit.famille];
  const suffixe = demo ? "&demo=1" : "";

  const d = demo ? donneesDemo(produit.famille) : await lireTout(produit.app_id, produit.famille, jours);
  const parEvenement = new Map(d.comptes.map((c) => [c.event, c]));

  const heuresSansDonnee = d.heures;
  const premiere = d.entonnoir[0]?.installations ?? 0;

  const cohortes = new Map<string, { taille: number; semaines: Map<number, number> }>();
  for (const c of d.cohortes) {
    const e = cohortes.get(c.cohorte) ?? { taille: c.taille, semaines: new Map() };
    e.semaines.set(c.semaine, c.actifs);
    cohortes.set(c.cohorte, e);
  }
  const maxSemaine = d.cohortes.reduce((m, c) => Math.max(m, c.semaine), 0);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">Les chiffres</h1>

      {demo && (
        <div className="mt-4 rounded-xl border-2 border-dashed border-text-heading p-4 text-sm font-semibold text-text-heading" role="note">
          DONNÉES D&apos;EXEMPLE — rien de ceci n&apos;est mesuré. C&apos;est seulement pour voir à quoi ressemble le tableau
          de bord. Les vrais chiffres apparaissent sans « ?demo=1 ».
        </div>
      )}

      <nav className="mt-4 flex flex-wrap items-center gap-2 text-sm" aria-label="Produit et période">
        <Link
          href={`/admin/kpi/comparatif?jours=${jours}${suffixe}`}
          className="rounded-full border border-text-heading bg-text-heading px-3 py-1 font-semibold text-bg-primary"
        >
          Comparer tous les produits
        </Link>
        <span className="mx-1 text-text-body-subtle">·</span>
        {produits.map((p) => (
          <Link
            key={p.app_id}
            href={`?app=${p.app_id}&jours=${jours}${suffixe}`}
            aria-current={p.app_id === produit.app_id ? "page" : undefined}
            className={`rounded-full border px-3 py-1 ${p.app_id === produit.app_id ? "border-text-heading font-semibold text-text-heading" : "border-border-light text-text-body-subtle"}`}
          >
            {p.nom}
          </Link>
        ))}
        <span className="mx-2 text-text-body-subtle">·</span>
        {PERIODES.map((j) => (
          <Link
            key={j}
            href={`?app=${produit.app_id}&jours=${j}${suffixe}`}
            aria-current={j === jours ? "page" : undefined}
            className={`rounded-full border px-3 py-1 ${j === jours ? "border-text-heading font-semibold text-text-heading" : "border-border-light text-text-body-subtle"}`}
          >
            {j} jours
          </Link>
        ))}
      </nav>

      {d.erreur && (
        <div className="mt-6 rounded-xl border border-border-light bg-bg-secondary p-4 text-sm text-text-body-subtle" role="alert">
          La base n&apos;a pas répondu : <span className="font-mono text-xs">{d.erreur}</span>. Si la migration{" "}
          <span className="font-mono text-xs">017_mesure_multiproduits.sql</span> n&apos;est pas passée, c&apos;est attendu.
        </div>
      )}

      {/* Verdict */}
      <section className="mt-8 rounded-xl border border-border-light bg-bg-secondary p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-text-body-subtle">Ce qu&apos;il faut retenir</p>
        <p className="mt-2 text-lg text-text-heading">{verdict(d.entonnoir, titres)}</p>
        <p className="mt-3 text-xs text-text-body-subtle">
          Source : {demo ? <strong>exemple, rien de réel</strong> : <><strong>mesuré</strong> (événements reçus)</>}. Dernière donnée :{" "}
          {heuresSansDonnee === null ? "aucune reçue" : heuresSansDonnee < 1 ? "il y a moins d'une heure" : `il y a ${heuresSansDonnee} h`}
          {d.fraicheur ? ` · ${d.fraicheur.evenements_24h} événements sur 24 h` : ""}.
        </p>
      </section>

      {/* Entonnoir */}
      {d.entonnoir.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-xl font-bold text-text-heading">Où l&apos;on perd les gens</h2>
          <ol className="mt-4 space-y-3">
            {d.entonnoir.map((e, i) => {
              const lecture = lireEchantillon(e.installations, i === 0 ? premiere : d.entonnoir[i - 1].installations);
              const largeur = premiere ? Math.max(2, Math.round((e.installations / premiere) * 100)) : 2;
              return (
                <li key={e.etape}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-medium text-text-heading">{titres[i]?.titre ?? e.etape}</span>
                    {i === 0 ? (
                      <span className="font-display text-2xl font-bold text-text-heading">{e.installations}</span>
                    ) : (
                      <Mesure lecture={lecture} />
                    )}
                  </div>
                  <div className="mt-1 h-2 rounded bg-border-light" aria-hidden="true">
                    <div className="h-2 rounded bg-text-heading" style={{ width: `${largeur}%` }} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {/* Sources (landings) */}
      {produit.famille === "landing" && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-text-heading">D&apos;où viennent les visiteurs</h2>
          {d.sources.length === 0 ? (
            <p className="mt-3 text-sm text-text-body-subtle">Aucune visite mesurée sur la période.</p>
          ) : (
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr className="text-left text-text-body-subtle">
                  <th className="py-2 font-semibold">Source</th>
                  <th className="py-2 text-right font-semibold">Visiteurs</th>
                  <th className="py-2 text-right font-semibold">Cliquent</th>
                </tr>
              </thead>
              <tbody>
                {d.sources.map((s) => {
                  const l = lireEchantillon(s.cliqueurs, s.visiteurs);
                  return (
                    <tr key={s.source} className="border-t border-border-light">
                      <td className="py-2 text-text-heading">{s.source}</td>
                      <td className="py-2 text-right tabular-nums">{s.visiteurs}</td>
                      <td className="py-2 text-right tabular-nums">
                        {s.cliqueurs} <span className="text-text-body-subtle">({formaterPart(l)})</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      )}

      {/* Retention par cohorte (apps) */}
      {produit.famille === "app" && (
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold text-text-heading">Ceux qui restent, par semaine d&apos;arrivée</h2>
          {cohortes.size === 0 ? (
            <p className="mt-3 text-sm text-text-body-subtle">Pas encore de cohorte : il faut au moins une ouverture mesurée.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-text-body-subtle">
                    <th className="py-2 pr-4 font-semibold">Arrivés la semaine du</th>
                    <th className="py-2 pr-4 text-right font-semibold">Nombre</th>
                    {Array.from({ length: maxSemaine + 1 }, (_, k) => (
                      <th key={k} className="py-2 px-2 text-right font-semibold">
                        {k === 0 ? "S0" : `S+${k}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from(cohortes.entries()).map(([date, c]) => (
                    <tr key={date} className="border-t border-border-light">
                      <td className="py-2 pr-4 text-text-heading">{date}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{c.taille}</td>
                      {Array.from({ length: maxSemaine + 1 }, (_, k) => {
                        const actifs = c.semaines.get(k);
                        return (
                          <td key={k} className={`px-2 py-2 text-right tabular-nums ${c.taille < SEUIL_LECTURE ? "text-text-body-subtle" : "text-text-heading"}`}>
                            {actifs === undefined ? "·" : c.taille < SEUIL_LECTURE ? `${actifs}` : `${actifs} (${Math.round((actifs / c.taille) * 100)} %)`}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-2 text-xs text-text-body-subtle">
                Sous {SEUIL_LECTURE} personnes dans une cohorte, seul le nombre est affiché : un pourcentage serait trompeur.
              </p>
            </div>
          )}
        </section>
      )}

      {/* Detail des evenements */}
      <section className="mt-10 overflow-hidden rounded-xl border border-border-light">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-text-heading">Événement</th>
              <th className="px-5 py-3 text-right font-semibold text-text-heading">Personnes (7 j)</th>
              <th className="px-5 py-3 text-right font-semibold text-text-heading">Personnes ({jours} j)</th>
            </tr>
          </thead>
          <tbody>
            {d.comptes
              .slice()
              .sort((a, b) => b.installations - a.installations)
              .map((c) => (
                <tr key={c.event} className="border-t border-border-light">
                  <td className="px-5 py-3 font-mono text-xs text-text-heading">{c.event}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-text-heading">{c.installations_7j}</td>
                  <td className="px-5 py-3 text-right tabular-nums text-text-body-subtle">{parEvenement.get(c.event)?.installations}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>

      <p className="mt-6 text-xs text-text-body-subtle">
        Un zéro ne veut pas dire que la mesure est cassée : il faut que quelqu&apos;un utilise le produit. Chaque produit se
        lit contre lui-même, jamais contre un autre. Aucune donnée personnelle n&apos;entre ici.
      </p>
    </div>
  );
}
