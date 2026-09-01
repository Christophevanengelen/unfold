"use client";

/**
 * L ecran qui DEMANDE avant que le systeme demande.
 *
 * Pourquoi il existe : au 01/09/2026, la table des jetons etait vide. Pas un
 * seul enregistrement, alors que l app etait utilisee — 31 ouvertures et trois
 * onboardings termines en trois jours. Le systeme de notifications entier,
 * cron compris, tournait pour personne.
 *
 * La cause n etait pas une panne. C est que RIEN ne les proposait jamais. Le
 * reglage existait, cache dans le tiroir de profil ; il fallait aller le
 * chercher sans savoir qu il existait. lib/push.ts prevoyait pourtant cet
 * ecran — `dejaPropose()` et `marquerPropose()` y attendaient depuis le debut,
 * appelees de nulle part.
 *
 * LA CONTRAINTE QUI GOUVERNE TOUT : sur iOS, la boite systeme ne s affiche
 * qu une seule fois dans la vie de l installation. Apres un refus, il n y a
 * plus rien a faire depuis l app — il faut envoyer la personne dans les
 * Reglages, et presque personne n y va. On ne depense donc cette occasion
 * unique qu apres avoir explique ce qu on enverra, et seulement si elle dit oui
 * a notre ecran d abord.
 *
 * LE MOMENT : apres que la personne a vu son premier signal. Avant, on demande
 * une permission pour un produit qu elle ne connait pas encore ; apres, on la
 * demande pour quelque chose dont elle vient de voir la valeur.
 */

import { useEffect, useState } from "react";
import { BottomSheet } from "@/components/demo/primitives";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { mesurer } from "@/lib/mesure";
import {
  etatPermission,
  demanderPuisEnregistrer,
  dejaPropose,
  marquerPropose,
} from "@/lib/push";

export function PropositionNotifications({ pret }: { pret: boolean }) {
  const l = detectLocale();
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!pret) return;
    // On ne propose qu une fois. `dejaPropose` renvoie vrai quand le stockage
    // est refuse, ce qui vaut « ne harcele pas ».
    if (dejaPropose()) return;
    let vivant = true;
    void etatPermission().then((etat) => {
      if (!vivant) return;
      // « jamais_demande » : le cas normal, l occasion est intacte.
      //
      // « erreur » AUSSI, et c est le point. Cet etat veut dire « le greffon n a
      // pas repondu, on NE SAIT PAS » — pas « la personne a refuse ». Traiter ce
      // doute comme un non definitif etait exactement la faute qui masquait le
      // reglage dans le tiroir de profil : un etat inconnu rendu comme une
      // absence.
      //
      // Si le greffon est reellement casse, demanderPuisEnregistrer renverra
      // « erreur » et on le MESURERA. Une panne mesuree vaut infiniment mieux
      // qu un silence : au 01/09, zero jeton enregistre et rien pour dire si
      // personne n avait demande ou si tout le monde echouait.
      //
      // Les autres etats — « accorde », « refuse » — signifient que le systeme
      // a deja tranche : l occasion unique d iOS est depensee, cet ecran n y
      // peut plus rien.
      if (etat === "jamais_demande" || etat === "erreur") setOuvert(true);
    });
    return () => {
      vivant = false;
    };
  }, [pret]);

  function fermer() {
    marquerPropose();
    setOuvert(false);
  }

  return (
    <BottomSheet open={ouvert} onClose={fermer} maxHeight="auto">
      <div className="px-5 pb-6 pt-1">
        <h2
          className="font-display text-lg font-bold"
          style={{ color: "var(--text-heading)" }}
        >
          {perso("notif.titre", l)}
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--text-body)" }}>
          {perso("notif.corps", l)}
        </p>

        <button
          type="button"
          onClick={() => {
            marquerPropose();
            // On mesure la demande AVANT son issue : sans elle, un refus systeme
            // et quelqu un qui n a jamais vu cet ecran restent indiscernables.
            mesurer("notif_demandee");
            void demanderPuisEnregistrer().then((etat) => {
              if (etat === "accorde") mesurer("notif_accordee");
              else if (etat === "refuse") mesurer("notif_refusee");
              else if (etat === "erreur") mesurer("notif_echec");
              setOuvert(false);
            });
          }}
          className="mt-5 w-full rounded-full py-3.5 text-sm font-semibold active:scale-95"
          style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
        >
          {perso("notif.oui", l)}
        </button>

        <button
          type="button"
          onClick={fermer}
          className="mt-2 w-full rounded-full py-3 text-sm font-medium"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {perso("notif.plus_tard", l)}
        </button>

        <p
          className="mt-3 text-center text-xs"
          style={{ color: "var(--text-body-subtle)" }}
        >
          {perso("notif.reglages", l)}
        </p>
      </div>
    </BottomSheet>
  );
}
