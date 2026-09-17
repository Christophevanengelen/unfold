"use client";

/**
 * « Ta vie entiere » — le resume d une vie, sur son propre ecran.
 *
 * Christophe, le 17/09 : « pareil pour le resume important de toute une vie ».
 *
 * POURQUOI UN ECRAN ET PAS UNE CARTE DE PLUS
 *
 * Le resume du jour arrive dans la boite : c est une communication, elle se
 * consulte et se referme. Celui-ci ne change pas d un jour a l autre — il n a
 * donc rien a faire dans une boite aux lettres, et tout a gagner a avoir de la
 * place. Il vit ici, et le tiroir de profil y mene.
 *
 * Il ne fait AUCUN appel : toutes les periodes d une vie sont deja dans
 * l appareil, mille huit cents environ sur le cas de test.
 */

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/i18n-demo";
import { lireLaVie } from "@/lib/resume-vie";
import { ResumeVie } from "@/components/demo/resume/ResumeVie";

export default function ViePage() {
  const locale = useLocale();
  const { phases, birthData } = useMomentum();

  // Fige a l ouverture de l ecran : voir la meme precaution dans
  // CentreMessages. Une vie ne se relit pas a la milliseconde.
  const [maintenant] = useState(() => Date.now());
  // La dependance est `birthData` entier, pas `birthData?.birthDate` : le
  // compilateur React deduit la premiere et refuse d optimiser quand on lui en
  // declare une plus fine. Recalculer parce que l heure de naissance a change
  // est de toute facon ce qu on veut.
  const naissanceIso = birthData?.birthDate ?? null;
  const resume = useMemo(
    () => (naissanceIso ? lireLaVie(phases, naissanceIso, maintenant) : null),
    [phases, naissanceIso, maintenant],
  );

  const naissance = birthData?.birthDate
    ? `${birthData.birthDate}T${birthData.birthTime || "00:00"}`
    : null;

  return (
    <div className="min-h-screen pb-32">
      <PageHeader backHref="/app/timeline" title={t("resume.vie_eyebrow", locale)} />

      <div className="mx-auto w-full max-w-[440px] px-5 pt-3">
        {resume && !resume.vide && naissance ? (
          <ResumeVie resume={resume} naissance={naissance} locale={locale} />
        ) : (
          <p className="px-2 py-16 text-center text-[13px] leading-snug text-text-body-subtle">
            {t("resume.jour_rien_aide", locale)}
          </p>
        )}
      </div>
    </div>
  );
}
