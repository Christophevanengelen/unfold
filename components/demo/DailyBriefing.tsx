"use client";

/**
 * La collecte des briefings.
 *
 * ─── CE QUE CE FICHIER ETAIT, ET POURQUOI IL A CHANGE ──────────────────────
 *
 * Il rendait DEUX cartes — « Aujourd hui » et « En ce moment » — montees par la
 * timeline en `absolute inset-0 z-30 flex items-center justify-center`, donc
 * centrees par-dessus le produit entier, chacune avec sa croix, toutes deux
 * affichees en meme temps.
 *
 *   « foutre 25 fenetres a cliquer pour les closer, c est pas de l UX, c est de
 *     la punition pour user. Tu veux conserver ca, tu me crees un vrai systeme
 *     de notification qui vient pas par dessus tout. »  — Christophe, 01/09/2026
 *
 * Il ne rend donc plus RIEN. Il va chercher les deux briefings et les depose
 * dans lib/messages.ts. L affichage vit dans CentreMessages.tsx, derriere une
 * pastille qu on ouvre.
 *
 * ─── LE DEFAUT QUI EXPLIQUE CE QU ON VOYAIT A L ECRAN ──────────────────────
 *
 * L ancienne version appelait `fetch(endpoint)` avec un chemin RELATIF. Dans
 * l app native l origine est `capacitor://localhost` : un chemin relatif n y
 * mene nulle part et la requete echoue en silence. Le client affichait alors le
 * repli « Le calcul n a pas abouti » comme une carte normale. C est le motif
 * recurrent de ce depot, documente dans CLAUDE.md : tout appel reseau passe par
 * `apiFetch`.
 *
 * ─── LA REGLE QUI RESTE ────────────────────────────────────────────────────
 *
 * On ne depose JAMAIS un echec dans la boite. Pas de message vaut mieux qu un
 * message qui dit que ca n a pas marche : la personne n a rien a en faire, et
 * ca allume la pastille pour rien.
 */

import { buildEffectiveProfile } from "@/lib/effective-profile";
import { getObservedProfileSync } from "@/lib/observed-profile";
import { getUserProfileSync } from "@/lib/user-profile";
import { useEffect } from "react";
import { useMomentum } from "@/lib/momentum-store";
import { storage } from "@/lib/storage";
import { apiFetch } from "@/lib/api-client";
import { detectLocale } from "@/lib/i18n-demo";
import { deposer, cleDuJour, type TypeMessage } from "@/lib/messages";
import type { BirthData } from "@/lib/birth-data";

const TTL_MS = 12 * 60 * 60 * 1000;

interface Briefing {
  greeting?: string;
  summary?: string;
  action?: string;
  activeDomains?: string[];
  /** Presents quand la route signale un echec. Voir app/api/openai/*. */
  ok?: boolean;
  echec?: boolean;
}

const SOURCES: { endpoint: string; type: TypeMessage; cache: string }[] = [
  { endpoint: "/api/openai/daily-brief", type: "briefing_jour", cache: "daily_brief" },
  { endpoint: "/api/openai/daily-briefing", type: "briefing_periode", cache: "daily_briefing" },
];

/**
 * Les textes de repli que les routes ont longtemps renvoyes en 200 OK,
 * indiscernables d une reussite. Ce filet reste tant qu une reponse de cette
 * forme peut encore dormir dans un cache local, sur un telephone deja installe.
 */
const REPLIS_CONNUS = [
  "le calcul n'a pas abouti",
  "on ne peut pas calculer",
  "réessaie dans quelques minutes",
];

/**
 * Est-ce une vraie lecture ? Trois refus, du moins cher au plus cher.
 */
function estUneLecture(b: Briefing | null): b is Briefing & { summary: string } {
  if (!b) return false;
  if (b.ok === false || b.echec === true) return false;
  const corps = (b.summary ?? "").trim();
  // On mesure des CARACTERES, pas des mots separes par des espaces.
  //
  // Le test comptait `corps.split(/\s+/).length < 3`. Le japonais et le chinois
  // n ecrivent pas d espaces : un briefing entier y comptait pour UN mot, donc
  // il etait rejete. La boite aux lettres restait vide a vie dans ces deux
  // langues — et comme le cache n est ecrit que si ce test passe, les deux
  // routes OpenAI PAYANTES etaient rappelees a chaque montage de la timeline.
  //
  // Douze caracteres : au-dessus de tout ce qui pourrait etre un artefact
  // (« ok », « — », une clef de traduction non resolue), en dessous de la plus
  // courte phrase reelle dans n importe laquelle des dix langues.
  if (corps.length < 12) return false;
  const bas = corps.toLowerCase();
  return !REPLIS_CONNUS.some((r) => bas.includes(r));
}

async function collecter(birthData: BirthData, source: (typeof SOURCES)[number]): Promise<void> {
  const cleCache = cleDuJour(source.type).replace(source.type, source.cache);

  let briefing: Briefing | null = null;

  try {
    briefing = await storage.get<Briefing>(cleCache, TTL_MS);
  } catch {
    /* cache absent ou illisible : on demande au reseau */
  }

  if (!estUneLecture(briefing)) {
    try {
      const res = await apiFetch(source.endpoint, {
        method: "POST",
        // La langue part avec la requete. Sans elle, le modele repondait dans
        // celle de son prompt systeme — le francais — a tout le monde.
        // Le profil effectif — priorites declarees dans l onboarding, phase de
        // vie, ton — part avec la requete, memes sources que la fiche capsule.
        // Sans lui, le briefing etait le meme pour tout le monde.
        body: JSON.stringify({ birthData, locale: detectLocale(), userProfile: profilEffectif() }),
      });
      briefing = res.ok ? ((await res.json()) as Briefing) : null;
    } catch {
      // Reseau coupe. Rien a deposer, rien a dire : la boite reste en l etat et
      // la prochaine ouverture de l ecran reessaiera.
      return;
    }
    if (estUneLecture(briefing)) {
      try {
        await storage.set(cleCache, briefing);
      } catch {
        /* quota plein : on affiche quand meme */
      }
    }
  }

  if (!estUneLecture(briefing)) return;

  deposer({
    type: source.type,
    corps: briefing.summary.trim(),
    action: briefing.action?.trim() || undefined,
    domaines: briefing.activeDomains,
  });
}

/**
 * Ne rend rien. A monter une fois, n importe ou dans l arbre de l app.
 *
 * Le nom du composant est conserve : il est importe ailleurs, et le renommer
 * aurait pose un diff de deplacement par-dessus un diff de fond.
 */
/** Memes sources que CapsuleDetailSheet : declare + observe, ou null. */
function profilEffectif() {
  const declare = getUserProfileSync();
  return declare ? buildEffectiveProfile(declare, getObservedProfileSync()) : null;
}

export function DailyBriefing() {
  const { birthData } = useMomentum();

  useEffect(() => {
    if (!birthData) return;
    let annule = false;

    void (async () => {
      for (const source of SOURCES) {
        if (annule) return;
        // En serie et non en parallele : les deux routes appellent le meme
        // fournisseur derriere un compteur d usage partage, et deux requetes
        // simultanees se comptent double pour un seul ecran.
        await collecter(birthData, source);
      }
    })();

    return () => {
      annule = true;
    };
  }, [birthData]);

  return null;
}
