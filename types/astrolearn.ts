/**
 * Types partages entre la route serveur et l interface.
 *
 * Ils vivaient dans app/api/.../people/route.ts. Le build natif met les routes
 * d API de cote (elles ne s exportent pas statiquement), donc un composant qui
 * importait ses types depuis une route cassait la compilation. Ils vivent ici
 * maintenant : la route et l interface s y referent tous les deux.
 */

export type PersonResult = {
  id: string;
  source: "astrolearn" | "unfold";
  label: string;
  personId?: string;
  username?: string;
  deviceId?: string;
  birthDate?: string;
  birthTime?: string;
  city?: string;
  picture?: string;
  hasCompleteBirthData: boolean;
};

export type PeopleSource = "mine" | "astrolearn" | "bubble" | "unfold";
