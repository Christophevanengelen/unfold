/**
 * Les chiffres de Favorable.
 *
 * Cette page affichait « Connect your analytics provider to see live data ».
 * C etait exact : rien n etait mesure. Depuis la migration 009 et la route
 * /api/events, les evenements arrivent dans la table app_events. Cette page les
 * lit et les montre, en francais, sans qu il faille ecrire une requete.
 *
 * Composant serveur : la lecture se fait avec la cle de service, jamais depuis
 * le navigateur. L acces est deja protege par mot de passe (middleware.ts).
 *
 * La retention n est pas stockee, elle est calculee a la lecture par la
 * fonction retention_app. Une app ne sait pas de facon fiable quel jour elle en
 * est, surtout si on change d appareil.
 */

import { getAdminClient } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const EVENEMENTS: { cle: string; titre: string; aide: string }[] = [
  { cle: "app_ouverte", titre: "Ouvertures", aide: "Chaque lancement de l'app ou du site." },
  { cle: "onboarding_demarre", titre: "Onboarding commencé", aide: "Une fois par installation." },
  { cle: "onboarding_termine", titre: "Onboarding terminé", aide: "Une fois par installation." },
  { cle: "premier_signal_vu", titre: "Premier signal vu", aide: "Le moment où la promesse est tenue." },
  { cle: "signal_ouvert", titre: "Signaux ouverts", aide: "Chaque période consultée." },
];

type Comptes = Record<string, { j7: number; j30: number }>;

async function lire(): Promise<{
  comptes: Comptes;
  retention: { installations: number; revenus_j1: number; revenus_j7: number } | null;
  erreur: string | null;
}> {
  const vide: Comptes = {};
  for (const e of EVENEMENTS) vide[e.cle] = { j7: 0, j30: 0 };

  try {
    const supabase = getAdminClient();
    const maintenant = Date.now();
    const j7 = new Date(maintenant - 7 * 864e5).toISOString();
    const j30 = new Date(maintenant - 30 * 864e5).toISOString();

    const comptes: Comptes = { ...vide };
    for (const e of EVENEMENTS) {
      const [a, b] = await Promise.all([
        supabase.from("app_events").select("*", { count: "exact", head: true })
          .eq("event", e.cle).gte("created_at", j7),
        supabase.from("app_events").select("*", { count: "exact", head: true })
          .eq("event", e.cle).gte("created_at", j30),
      ]);
      comptes[e.cle] = { j7: a.count ?? 0, j30: b.count ?? 0 };
    }

    const { data: ret } = await supabase.rpc("retention_app");
    const ligne = Array.isArray(ret) ? ret[0] : ret;

    return { comptes, retention: ligne ?? null, erreur: null };
  } catch (err) {
    return {
      comptes: vide,
      retention: null,
      erreur: err instanceof Error ? err.message : "lecture impossible",
    };
  }
}

function pourcent(part: number, total: number): string {
  if (!total) return "—";
  return `${Math.round((part / total) * 100)} %`;
}

export default async function KPIPage() {
  const { comptes, retention, erreur } = await lire();

  const demarres = comptes["onboarding_demarre"].j30;
  const termines = comptes["onboarding_termine"].j30;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-text-heading">Les chiffres</h1>
      <p className="mt-2 text-text-body-subtle">
        Ce que fait Favorable, mesuré depuis le 31 août 2026. Aucune donnée personnelle.
      </p>

      {erreur && (
        <div className="mt-6 rounded-xl border border-border-light bg-bg-secondary p-4 text-sm text-text-body-subtle">
          La base n&apos;a pas répondu : <span className="font-mono text-xs">{erreur}</span>.
          Si la migration <span className="font-mono text-xs">009_app_events.sql</span> n&apos;est
          pas passée, c&apos;est attendu.
        </div>
      )}

      {/* Ce qui compte le plus, en haut */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-body-subtle">
            Reviennent le lendemain
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-text-heading">
            {retention ? pourcent(retention.revenus_j1, retention.installations) : "—"}
          </p>
          <p className="mt-1 text-xs text-text-body-subtle">
            sur {retention?.installations ?? 0} installations
          </p>
        </div>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-body-subtle">
            Reviennent une semaine après
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-text-heading">
            {retention ? pourcent(retention.revenus_j7, retention.installations) : "—"}
          </p>
          <p className="mt-1 text-xs text-text-body-subtle">
            le chiffre qui décide de la suite
          </p>
        </div>

        <div className="rounded-xl border border-border-light bg-bg-secondary p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-body-subtle">
            Finissent l&apos;onboarding
          </p>
          <p className="mt-2 font-display text-4xl font-bold text-text-heading">
            {pourcent(termines, demarres)}
          </p>
          <p className="mt-1 text-xs text-text-body-subtle">
            {termines} sur {demarres} qui l&apos;ont commencé
          </p>
        </div>
      </div>

      {/* Le detail */}
      <div className="mt-10 overflow-hidden rounded-xl border border-border-light">
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-text-heading">Événement</th>
              <th className="px-5 py-3 text-right font-semibold text-text-heading">7 jours</th>
              <th className="px-5 py-3 text-right font-semibold text-text-heading">30 jours</th>
            </tr>
          </thead>
          <tbody>
            {EVENEMENTS.map((e) => (
              <tr key={e.cle} className="border-t border-border-light">
                <td className="px-5 py-3">
                  <span className="font-medium text-text-heading">{e.titre}</span>
                  <span className="ml-2 text-xs text-text-body-subtle">{e.aide}</span>
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-text-heading">
                  {comptes[e.cle].j7}
                </td>
                <td className="px-5 py-3 text-right tabular-nums text-text-body-subtle">
                  {comptes[e.cle].j30}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-text-body-subtle">
        Un zéro ne veut pas dire que la mesure est cassée : il faut que quelqu&apos;un ouvre
        l&apos;app. La rétention à sept jours ne dira rien avant huit jours.
      </p>
    </div>
  );
}
