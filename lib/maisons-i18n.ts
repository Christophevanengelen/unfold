/**
 * Les douze domaines de vie, dans les dix langues du produit.
 *
 * `lib/domain-config.tsx` porte ces libelles en francais uniquement, et
 * `lib/event-labels.ts` dit dans son en-tete que la couche de contenu ne parle
 * que francais et anglais — les huit autres langues retombent sur l anglais.
 *
 * Acceptable dans l app, ou le mot est entoure de contexte. Inacceptable dans
 * une notification : « Carriere » seul, pousse sur l ecran verrouille de
 * quelqu un qui a choisi le japonais, ne veut rien dire.
 *
 * Douze mots courts par langue. Ce sont des noms de domaines de vie, pas du
 * contenu interpretatif : ils se traduisent sans trahison, contrairement aux
 * titres de periodes.
 */

export type NumeroMaison = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

const MAISONS: Record<string, Record<NumeroMaison, string>> = {
  fr: { 1:"Identité", 2:"Argent", 3:"Communication", 4:"Foyer", 5:"Créativité", 6:"Quotidien",
        7:"Couple", 8:"Transformations", 9:"Horizon", 10:"Carrière", 11:"Réseau", 12:"Intériorité" },
  en: { 1:"Identity", 2:"Money", 3:"Communication", 4:"Home", 5:"Creativity", 6:"Daily life",
        7:"Partnership", 8:"Transformation", 9:"Horizon", 10:"Career", 11:"Network", 12:"Inner life" },
  es: { 1:"Identidad", 2:"Dinero", 3:"Comunicación", 4:"Hogar", 5:"Creatividad", 6:"Día a día",
        7:"Pareja", 8:"Transformación", 9:"Horizonte", 10:"Carrera", 11:"Red", 12:"Interioridad" },
  de: { 1:"Identität", 2:"Geld", 3:"Kommunikation", 4:"Zuhause", 5:"Kreativität", 6:"Alltag",
        7:"Partnerschaft", 8:"Wandlung", 9:"Horizont", 10:"Beruf", 11:"Netzwerk", 12:"Innenleben" },
  it: { 1:"Identità", 2:"Denaro", 3:"Comunicazione", 4:"Casa", 5:"Creatività", 6:"Quotidiano",
        7:"Coppia", 8:"Trasformazione", 9:"Orizzonte", 10:"Carriera", 11:"Rete", 12:"Interiorità" },
  pt: { 1:"Identidade", 2:"Dinheiro", 3:"Comunicação", 4:"Lar", 5:"Criatividade", 6:"Quotidiano",
        7:"Relação", 8:"Transformação", 9:"Horizonte", 10:"Carreira", 11:"Rede", 12:"Interioridade" },
  nl: { 1:"Identiteit", 2:"Geld", 3:"Communicatie", 4:"Thuis", 5:"Creativiteit", 6:"Dagelijks leven",
        7:"Relatie", 8:"Transformatie", 9:"Horizon", 10:"Carrière", 11:"Netwerk", 12:"Innerlijk" },
  ja: { 1:"自分", 2:"お金", 3:"つながり", 4:"家庭", 5:"創造", 6:"日常",
        7:"パートナー", 8:"変容", 9:"視野", 10:"仕事", 11:"仲間", 12:"内面" },
  zh: { 1:"自我", 2:"金钱", 3:"沟通", 4:"家庭", 5:"创造", 6:"日常",
        7:"伴侣", 8:"转变", 9:"视野", 10:"事业", 11:"人脉", 12:"内在" },
  ar: { 1:"الذات", 2:"المال", 3:"التواصل", 4:"البيت", 5:"الإبداع", 6:"اليومي",
        7:"الشراكة", 8:"التحوّل", 9:"الأفق", 10:"المسار المهني", 11:"الشبكة", 12:"الحياة الداخلية" },
};

/**
 * Le nom du domaine dans la langue demandee.
 * Retombe sur l anglais plutot que le francais : quelqu un dont la langue nous
 * manque a plus de chances de lire l anglais.
 */
export function nomMaison(numero: number, locale: string | null | undefined): string | null {
  const table = MAISONS[(locale ?? "en").slice(0, 2).toLowerCase()] ?? MAISONS.en;
  return table[numero as NumeroMaison] ?? null;
}

export const LANGUES_MAISONS = Object.keys(MAISONS);
