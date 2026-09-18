"use client";

/**
 * Le match SOLO : la seconde des deux facons d avoir un match.
 *
 * Christophe, le 18/09 : « au total, il y a deux facons. Soit deux apps se
 * connectent, soit une seule app peut encoder elle-meme un match qu elle a
 * envie de faire. » Cet ecran est la seconde voie — accessible depuis
 * AjouterMatchSheet, sur app/app/compatibility/page.tsx.
 *
 * ─── DEUX ECRANS, PAS TROIS ──────────────────────────────────────────────────
 *
 *   1. Saisie : nom + naissance de l autre personne. C EST LE MEME COMPOSANT
 *      que l onboarding et que « Ma naissance » (StepInput, mode « solo ») —
 *      champ ville avec geocodage compris. Aucune troisieme copie du champ
 *      ville, pour la raison deja ecrite dans EditionNaissance.tsx.
 *   2. Fiche : la categorie (chips, deja assignee a une valeur par defaut et
 *      modifiable ici meme) PUIS la fiche de compatibilite complete, generee
 *      immediatement. Pas d ecran separe pour choisir la categorie : c est la
 *      consigne du chantier.
 *
 * ─── REUTILISE SANS MODIFICATION ─────────────────────────────────────────────
 *
 * ConnectionReport → RapportMatch prend juste { moi, autre, nomAutre } et
 * fonctionne DEJA pour n importe quelle paire de naissances, connectee ou
 * pas. Un match solo n a donc demande AUCUN changement a ce composant.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "flowbite-react-icons/outline";
import { StepInput, type OnboardingFormData } from "@/components/demo/onboarding/StepInput";
import { ConnectionReport } from "@/components/demo/compat/ConnectionReport";
import { relationshipConfig, relationshipOrder } from "@/components/demo/compat/relationshipConfig";
import { texteLisible } from "@/lib/contraste";
import { useTheme } from "next-themes";
import {
  addSoloConnection,
  updateRelationship,
  type RealConnection,
  type RelationshipType,
} from "@/lib/connections-store";
import { resolveCity, type BirthData } from "@/lib/birth-data";
import { useMomentum } from "@/lib/momentum-store";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";

const FORM_VIDE: OnboardingFormData = {
  nickname: "",
  dob: "",
  timeOfBirth: "",
  placeOfBirth: "",
  resolvedCoords: undefined,
};

export default function NouveauMatchSoloPage() {
  const locale = useLocale();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "light" ? "clair" : "sombre";
  const { birthData: myBirthData } = useMomentum();

  const [etape, setEtape] = useState<"saisie" | "fiche">("saisie");
  const [formData, setFormData] = useState<OnboardingFormData>(FORM_VIDE);
  const [connexion, setConnexion] = useState<RealConnection | null>(null);

  // Le verrou empeche deux creations pour un seul appui — voir la meme
  // discipline dans EditionNaissance.tsx.
  const [creationEnCours, setCreationEnCours] = useState(false);

  function creerMatch() {
    if (creationEnCours) return;
    // Les coordonnees viennent du geocodage si une suggestion a ete choisie,
    // sinon de la table locale. StepInput ne laisse pas avancer sans l une des
    // deux (voir `lieuSitue` dans ce composant) — cette seconde verification
    // est un filet, pas la premiere ligne de defense.
    const coords =
      formData.resolvedCoords ??
      (() => {
        const c = resolveCity(formData.placeOfBirth);
        return c ? { lat: c.lat, lng: c.lng, timezone: c.tz } : null;
      })();
    if (!coords) return;

    const nom = formData.nickname.trim();
    if (!nom) return;

    const birthData: BirthData = {
      nickname: nom,
      birthDate: formData.dob,
      birthTime: formData.timeOfBirth,
      latitude: coords.lat,
      longitude: coords.lng,
      timezone: coords.timezone,
      placeOfBirth: formData.placeOfBirth,
    };

    setCreationEnCours(true);
    // « friend » par defaut, comme le flux par code (voir app/app/invite/connected) —
    // la categorie s ajuste juste en dessous, sur CET ecran, sans detour.
    const nouvelle = addSoloConnection({ name: nom, relationship: "friend", birthData });
    setConnexion(nouvelle);
    setEtape("fiche");
    setCreationEnCours(false);
  }

  const handleChangeCategorie = (key: RelationshipType) => {
    if (!connexion || key === connexion.relationship) return;
    updateRelationship(connexion.id, key);
    setConnexion({ ...connexion, relationship: key });
  };

  if (etape === "saisie") {
    return (
      <div className="h-full">
        <StepInput
          mode="solo"
          formData={formData}
          onChange={setFormData}
          onNext={creerMatch}
          onBack={() => router.push("/app/compatibility")}
        />
      </div>
    );
  }

  if (!connexion) {
    // Ne devrait pas arriver — creerMatch() pose `connexion` avant de changer
    // d etape — mais un ecran vide sans explication serait pire qu un repli.
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">{perso("compat.introuvable", locale)}</p>
      </div>
    );
  }

  return (
    <div className="pb-10">
      {/* En-tete : retour + nom, avec le meme badge discret « vu par toi
          seul·e » que la liste et la fiche connectee (ConnectionRow,
          ConnectionDetail) — jamais de mot comme « faux » ou « incomplet ». */}
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => router.push("/app/compatibility")}
          className="text-text-body-subtle"
          aria-label={perso("compat.retour", locale)}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <p className="text-sm font-semibold text-text-heading">{connexion.name}</p>
          <p className="text-[10px] text-text-body-subtle">
            {perso(relationshipConfig[connexion.relationship].cleLabel, locale)} · {perso("compat.solo_badge", locale)}
          </p>
        </div>
      </div>

      {/* La categorie, assignee ici meme — pas un ecran de plus. */}
      <div className="mb-5">
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-text-body-subtle">
          {perso("compat.type_relation", locale)}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {relationshipOrder.map((key) => {
            const r = relationshipConfig[key];
            const isCurrent = key === connexion.relationship;
            const Icon = r.Icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleChangeCategorie(key)}
                className="flex items-center gap-2 rounded-xl px-3 text-[13px] font-medium transition-all active:scale-95"
                style={{
                  minHeight: "var(--taille-tactile-min)",
                  background: isCurrent
                    ? `color-mix(in srgb, ${r.color} 20%, transparent)`
                    : "var(--surface-light)",
                  color: isCurrent ? texteLisible(r.color, theme, 0.2) : "var(--text-body)",
                }}
              >
                <Icon
                  width={14}
                  height={14}
                  style={{ color: isCurrent ? texteLisible(r.color, theme, 0.2) : r.color }}
                />
                {perso(r.cleLabel, locale)}
              </button>
            );
          })}
        </div>
      </div>

      {/* La fiche de compatibilite, generee immediatement — RapportMatch n a
          demande aucun changement pour ce cas. */}
      <ConnectionReport connection={connexion} myBirthData={myBirthData} embedded />

      <button
        type="button"
        onClick={() => router.push("/app/compatibility")}
        className="mt-6 flex w-full items-center justify-center rounded-full text-sm font-semibold shadow-lg transition-transform active:scale-95"
        style={{
          minHeight: "var(--taille-tactile-min)",
          background: "var(--bg-brand)",
          color: "var(--text-on-brand)",
        }}
      >
        {perso("solo.voir_matchs", locale)}
      </button>
    </div>
  );
}
