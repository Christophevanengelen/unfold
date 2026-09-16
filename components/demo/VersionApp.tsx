"use client";

/**
 * Le numero de version, en bas du tiroir de profil.
 *
 * ─── POURQUOI ─────────────────────────────────────────────────────────────
 *
 * Le 17/09/2026, Christophe : « je vois rien qui bouge ». Trois builds avaient
 * ete livres sur TestFlight, et rien dans l app ne permettait de savoir LEQUEL
 * etait installe. On ne pouvait donc pas distinguer trois situations tres
 * differentes :
 *
 *   — la mise a jour n a pas ete installee ;
 *   — elle l a ete, mais l ecran regarde n avait pas change ;
 *   — elle l a ete, et quelque chose est casse.
 *
 * Une ligne de texte tranche entre les trois en une seconde. C est le genre de
 * detail qui n interesse personne jusqu au jour ou il fait gagner une heure.
 *
 * ─── COMMENT ──────────────────────────────────────────────────────────────
 *
 * `@capacitor/app` rend la version ET le numero de build, qui est celui
 * qu affiche TestFlight. Sur le web il n y a pas de build : on n affiche alors
 * rien plutot qu un numero inventé.
 *
 * L import est dynamique : sur le web, le module natif n a rien a charger.
 */

import { useEffect, useState } from "react";
import { isNative } from "@/lib/platform";

export function VersionApp() {
  const [ligne, setLigne] = useState<string | null>(null);

  useEffect(() => {
    if (!isNative()) return;
    let annule = false;
    (async () => {
      try {
        const { App } = await import("@capacitor/app");
        const info = await App.getInfo();
        if (!annule) setLigne(`${info.version} (${info.build})`);
      } catch {
        /* plugin absent : on n affiche rien, jamais un numero faux */
      }
    })();
    return () => {
      annule = true;
    };
  }, []);

  if (!ligne) return null;
  return (
    <p className="pt-4 text-center text-[11px] tabular-nums text-text-body-subtle">
      Favorable {ligne}
    </p>
  );
}
