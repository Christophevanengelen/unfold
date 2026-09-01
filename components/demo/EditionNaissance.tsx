"use client";

/**
 * Corriger ses donnees de naissance, depuis le profil.
 *
 * Avant, « Ma naissance » renvoyait dans l ONBOARDING COMPLET — quatre ecrans
 * de presentation, puis un formulaire VIDE ou il fallait ressaisir les quatre
 * champs. Changer une seule minute d heure de naissance demandait de refaire
 * tout le parcours de decouverte.
 *
 * Le formulaire est le meme composant que celui de l onboarding, en mode
 * « edition ». Ce n est pas de la paresse : il existait deja DEUX
 * implementations du champ ville dans le depot, dont l une nettement meilleure
 * que l autre, et c est exactement ce qui avait laisse la version d onboarding
 * se degrader sans que personne le voie. Une troisieme copie aurait recommence.
 *
 * L enregistrement compte sur trois corrections faites le meme jour, sans
 * lesquelles cet ecran n aurait rien change a l ecran :
 *
 *   - lib/supabase-store.ts utilise enfin apiFetch, donc l ecriture atteint le
 *     serveur depuis le telephone.
 *   - La clef de revalidation porte l empreinte complete, donc corriger l heure
 *     ou le lieu declenche un recalcul et pas seulement la date.
 *   - Les caches d affichage portent cette empreinte, donc l ancienne timeline
 *     ne peut plus etre resservie pendant le calcul.
 */

import { useRef, useState } from "react";
import { BottomSheet } from "@/components/demo/primitives";
import { StepInput } from "@/components/demo/onboarding/StepInput";
import { getBirthDataSync, resolveCity, type BirthData } from "@/lib/birth-data";
import { useMomentum } from "@/lib/momentum-store";
import type { OnboardingFormData } from "@/components/demo/onboarding/StepInput";

/**
 * Le preremplissage se fait a l INITIALISATION de l etat, pas dans un effet.
 *
 * Un effet qui appelle setState au montage declenche un second rendu — React 19
 * le signale, et c est exactement le motif qui peint une image intermediaire.
 * Ici le composant n est monte que lorsque la feuille s ouvre, donc lire les
 * donnees une fois a l initialisation suffit et ne coute aucun rendu de plus.
 */
function preremplir(): OnboardingFormData {
  const b = getBirthDataSync();
  return {
    nickname: b?.nickname ?? "",
    dob: b?.birthDate ?? "",
    timeOfBirth: b?.birthTime ?? "",
    placeOfBirth: b?.placeOfBirth ?? "",
    resolvedCoords:
      b && b.latitude !== undefined && b.longitude !== undefined
        ? { lat: b.latitude, lng: b.longitude, timezone: b.timezone }
        : undefined,
  };
}

export function EditionNaissance({
  ouvert,
  onFermer,
}: {
  ouvert: boolean;
  onFermer: () => void;
}) {
  const { loadSignals } = useMomentum();
  const [formData, setFormData] = useState<OnboardingFormData>(preremplir);

  // POURQUOI un verrou : `enregistrer` ferme la feuille PUIS lance un calcul de
  // 30 a 120 secondes. Entre le clic et la fermeture effective, le bouton reste
  // a l ecran et repond encore — la touche Entree maintenue, un double appui,
  // un rebond de la dalle tactile suffisent a lancer deux fois le meme calcul
  // et deux fois la meme ecriture. Le verrou est pose a l entree et rendu dans
  // `finally`, donc sur TOUS les chemins de sortie, y compris une erreur.
  const enregistrementEnCours = useRef(false);

  async function enregistrer() {
    if (!formData) return;
    if (enregistrementEnCours.current) return;
    // Les coordonnees viennent du geocodage si la personne a choisi une
    // suggestion, sinon de la table locale. Le formulaire garantit qu une des
    // deux existe — il ne laisse pas avancer sans lieu situe.
    const coords =
      formData.resolvedCoords ??
      (() => {
        const c = resolveCity(formData.placeOfBirth);
        return c ? { lat: c.lat, lng: c.lng, timezone: c.tz } : null;
      })();
    if (!coords) return;

    const birthData: BirthData = {
      nickname: formData.nickname,
      birthDate: formData.dob,
      birthTime: formData.timeOfBirth,
      latitude: coords.lat,
      longitude: coords.lng,
      timezone: coords.timezone,
      placeOfBirth: formData.placeOfBirth,
    };

    enregistrementEnCours.current = true;
    onFermer();
    try {
      // loadSignals enregistre et relance le calcul. La timeline se met a jour
      // toute seule : sa clef a change.
      await loadSignals(birthData);
    } finally {
      enregistrementEnCours.current = false;
    }
  }

  return (
    <BottomSheet open={ouvert} onClose={onFermer} maxHeight="92%">
      <div className="h-full px-1 pb-2">
        {formData && (
          <StepInput
            mode="edition"
            formData={formData}
            onChange={setFormData}
            onNext={() => void enregistrer()}
            onBack={onFermer}
          />
        )}
      </div>
    </BottomSheet>
  );
}
