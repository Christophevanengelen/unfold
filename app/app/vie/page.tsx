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

import { useCallback, useMemo, useState } from "react";
import { PageHeader } from "@/components/demo/primitives";
import { useMomentum } from "@/lib/momentum-store";
import { useLocale } from "@/lib/use-locale";
import { t } from "@/lib/i18n-demo";
import { lireLaVie } from "@/lib/resume-vie";
import { ResumeVie } from "@/components/demo/resume/ResumeVie";
import { afficheDisponible, dessinerAfficheDeVie } from "@/lib/carte-vie";
import { STRINGS_MATCH_DOMAINES } from "@/lib/i18n-demo";
import { DOMAINE } from "@/lib/score-match";
import { reussi, toucher } from "@/lib/haptique";

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

  const [preparation, setPreparation] = useState(false);
  const [partage, setPartage] = useState(false);

  /**
   * L affiche part en IMAGE, comme la carte de couple.
   *
   * C est l objet qui nous distingue : aucune autre app d astrologie ne peut
   * montrer une vie entiere d un seul regard, parce qu aucune ne tient la vie
   * entiere en donnees datees. Elle doit donc pouvoir sortir de l app.
   *
   * Trois niveaux de repli, et une annulation ne dit jamais rien : un partage
   * qui echoue ne casse pas l ecran d ou il part.
   */
  const surPartage = useCallback(async () => {
    if (!resume || resume.vide || !naissance) return;
    toucher();
    setPreparation(true);
    try {
      const noms = STRINGS_MATCH_DOMAINES(locale);
      const image = await dessinerAfficheDeVie({
        resume,
        naissance,
        eyebrow: t("resume.vie_eyebrow", locale),
        titre: t("resume.vie_titre", locale)
          .replace("{n}", String(resume.total))
          .replace("{age}", String(resume.age)),
        chapitresTitre: t("resume.vie_chapitres", locale),
        // Les noms sont resolus ICI : la fonction de dessin ne connait ni le
        // dictionnaire ni la structure des phases, et c est tres bien ainsi.
        chapitres: resume.chapitres.map((c) => ({
          nom: (c.phase.house ? noms[DOMAINE[c.phase.house]] : null) ?? c.phase.title,
          ageDebut: c.ageDebut,
          ageFin: c.ageFin,
        })),
        pied: "favorable.day",
      });

      const texte = t("resume.vie_titre", locale)
        .replace("{n}", String(resume.total))
        .replace("{age}", String(resume.age));

      if (image && navigator.share) {
        const fichier = new File([image], "favorable-vie.png", { type: "image/png" });
        if (!navigator.canShare || navigator.canShare({ files: [fichier] })) {
          await navigator.share({ files: [fichier], text: texte });
          reussi();
          setPartage(true);
          setTimeout(() => setPartage(false), 2000);
          return;
        }
      }
      if (navigator.share) await navigator.share({ title: "Favorable", text: texte });
      else await navigator.clipboard.writeText(texte);
      reussi();
      setPartage(true);
      setTimeout(() => setPartage(false), 2000);
    } catch {
      /* annule par la personne : l ecran n a pas bouge */
    } finally {
      setPreparation(false);
    }
  }, [resume, naissance, locale]);

  return (
    <div className="min-h-screen pb-32">
      <PageHeader backHref="/app/timeline" title={t("resume.vie_eyebrow", locale)} />

      <div className="mx-auto w-full max-w-[440px] px-5 pt-3">
        {resume && !resume.vide && naissance ? (
          <>
            <ResumeVie resume={resume} naissance={naissance} locale={locale} />

            {/* Le bouton n apparait que s il y a de quoi faire une affiche.
                En dessous de huit annees documentees, la frise ne ressemble a
                rien et l objet ne tient pas sa promesse — mieux vaut ne rien
                proposer que proposer une deception. */}
            {afficheDisponible(resume) ? (
            <div className="mt-4 flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={surPartage}
                disabled={preparation}
                className="rounded-full px-6 py-3 text-[14px] font-semibold disabled:opacity-60"
                style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
              >
                {partage || preparation
                  ? t("resume.vie_affiche_en_cours", locale)
                  : t("resume.vie_affiche", locale)}
              </button>
              <p className="max-w-[30ch] text-center text-[11px] leading-snug text-text-body-subtle">
                {t("resume.vie_affiche_aide", locale)}
              </p>
            </div>
            ) : null}
          </>
        ) : (
          <p className="px-2 py-16 text-center text-[13px] leading-snug text-text-body-subtle">
            {t("resume.jour_rien_aide", locale)}
          </p>
        )}
      </div>
    </div>
  );
}
