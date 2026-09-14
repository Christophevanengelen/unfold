/**
 * Le catalogue complet des ~177 endpoints du moteur de Marie-Ange
 * (API-COMPLETE-DOCUMENTATION.md, rafraichi le 12/09/2026), extrait une fois
 * hors-ligne — pas un appel reseau, pas une source de verite vivante.
 *
 * Aujourd'hui, lib/astrologue-routeur.ts n'en appelle que 4 (toctoc-year,
 * daily-briefing-context, connection-brief, toctoc-boudin-detail/app-short) :
 * les seuls compatibles avec le temps de reponse d'une conversation (brief
 * §3). Ce catalogue sert a autre chose : savoir ce qui EXISTE, pour que
 * l Appel A (lib/astrologue-comprehension.ts) reconnaisse une question qui
 * releve d un systeme entierement different — numerologie, Human Design,
 * BaZi, Feng Shui, Qi Men Dun Jia, Yi Jing, astrologie tibetaine, Jyotish —
 * plutot que de la forcer dans le systeme occidental des 12 maisons que
 * "Parle avec un astrologue" couvre seul aujourd'hui.
 *
 * Trouvaille en construisant ce catalogue (12/09/2026) : les `/api/query/*`
 * — explicitement documentes "Strategic query endpoints for chatbot use" —
 * sont marques par le moteur lui-meme "Not Available on Production — Not
 * routed in PHP". Bonne nouvelle : le routeur ne s appuyait deja pas dessus.
 * A confirmer avec Marie-Ange avant de jamais s y fier.
 */

import catalogue from "./astrologue-endpoints-catalogue.json";

export interface EndpointCatalogue {
  path: string;
  method: string;
  category: string;
  purpose: string;
  inputSummary: string;
  outputSummary: string;
  latencySeconds: number | null;
  relevantToWesternHouseSystem: boolean;
}

export const CATALOGUE_ENDPOINTS: EndpointCatalogue[] = catalogue as EndpointCatalogue[];

/**
 * Les systemes divinatoires entierement distincts du systeme occidental des
 * maisons — jamais les utilitaires (Person/Report, Chart Visualization), qui
 * ne sont pas des "autres systemes" mais de la plomberie. Cle = ce qu on
 * reconnait dans la phrase de la personne ; valeur = comment on en parle,
 * dans le ton du produit (jamais mystique, voir CLAUDE.md).
 */
export const AUTRES_SYSTEMES: Readonly<Record<string, string>> = Object.fromEntries(
  CATALOGUE_ENDPOINTS
    .filter((e) => !e.relevantToWesternHouseSystem)
    .filter((e) => !["Person/Report utilities", "Chart Visualization"].includes(e.category))
    .map((e) => e.category)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .map((cat) => [cat, cat]),
);
