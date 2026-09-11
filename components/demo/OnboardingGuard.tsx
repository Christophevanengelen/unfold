"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMomentum } from "@/lib/momentum-store";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";

/**
 * Redirects to /demo/onboarding if no birth data exists.
 * Shows a smooth loading skeleton while data loads — no blank flash.
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const locale = detectLocale();
  const { needsOnboarding, state, isLive, timelinePhases, birthData } = useMomentum();
  const router = useRouter();

  // Ce garde est monte autour de TOUTE l app (app/app/layout.tsx). Il ne
  // repondait pas a la question qu il pose — « cette personne a-t-elle une
  // naissance ? » — mais a une autre : « le moteur a-t-il repondu ? ». Mesure
  // du 11/09/2026 : le moteur met 42 a 50 s. Pendant tout ce temps, l app
  // entiere etait un rond qui tourne, et au bout du delai un « Connexion
  // perdue » plein ecran — alors que le nom des connexions, leur lien et leur
  // avatar sont en local et pourraient s afficher tout de suite.
  //
  // Desormais : des qu on sait que la naissance existe, les ecrans passent.
  // Chacun porte deja son propre etat de chargement, ligne par ligne. Le
  // reseau ne decide plus de ce qui s affiche, il decide de ce qui se remplit.
  const naissanceConnue = Boolean(birthData?.birthDate);

  useEffect(() => {
    if (needsOnboarding) {
      router.replace("/app/onboarding");
    }
  }, [needsOnboarding, router]);

  // Redirect in progress
  if (needsOnboarding) return null;

  // On n attend que la decision d onboarding, qui est une lecture locale de
  // quelques millisecondes — jamais la reponse du moteur.
  if (!naissanceConnue && (state === "idle" || state === "loading")) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-5 w-5 rounded-full border-2 border-transparent animate-spin"
          style={{
            borderTopColor: "var(--accent-purple)",
            borderRightColor: "var(--accent-purple)",
            opacity: 0.5,
          }}
        />
      </div>
    );
  }

  // Une panne du moteur ne fait plus disparaitre l app. Elle ne remplace
  // l ecran que pour quelqu un dont on n a meme pas la naissance — la, il n y
  // a effectivement rien a montrer.
  if (state === "error" && !naissanceConnue) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-text-body-subtle">{perso("garde.connexion_perdue", locale)}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-full px-4 py-2 text-xs font-medium"
          style={{ background: "var(--surface-light)", color: "var(--accent-purple)" }}
        >
          {perso("garde.reessayer", locale)}
        </button>
      </div>
    );
  }

  // Le troisieme verrou, et le plus trompeur : « Aucun signal detecte » quand
  // les deux sources sont vides. Tant que le moteur n a pas repondu, elles le
  // sont forcement — cette phrase s affichait donc a la place de l app entiere
  // pendant les quarante secondes d attente, en affirmant quelque chose de
  // faux sur la vie de la personne.
  //
  // Elle ne se justifie que si le moteur a repondu ET n a rien trouve. Un
  // chargement en cours n est pas une absence de signal.
  if (timelinePhases.length === 0 && !isLive && state === "ready" && !naissanceConnue) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-text-body-subtle">{perso("garde.aucun", locale)}</p>
      </div>
    );
  }

  return <>{children}</>;
}
