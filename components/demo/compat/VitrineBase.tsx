"use client";

/**
 * Ce qu on montre avant la premiere connexion.
 *
 * L ecran vide du Match posait un grand cadre au centre pour repeter, mot pour
 * mot, les deux boutons places juste dessous. Il occupait la moitie de l ecran
 * et n apprenait rien.
 *
 * A sa place : ce que la base contient vraiment. Des vies documentees, ce dont
 * elles parlent, et la mesure qui rend le reste credible — on ne parle que 8 %
 * du temps chez la vie mediane. C est ca qui donne envie d inviter quelqu un,
 * pas un cadre qui dit « invitez quelqu un ».
 *
 * Les visages viendront de la base de Marie-Ange. En attendant, une pastille
 * d initiales, dans le meme langage que les avatars de connexion : on ne pose
 * pas d image qu on n a pas.
 */

import { motion } from "motion/react";
import { EyebrowLabel } from "@/components/demo/primitives";
import { STRINGS_VITRINE_SUJETS, t, type Locale } from "@/lib/i18n-demo";
import { initiales, lireVitrine } from "@/lib/vitrine-base";

/** Trois familles suffisent a montrer la variete sans faire un annuaire. */
const FAMILLES_MONTREES = 3;
/** Deux noms par famille : au-dela, on lit une liste, plus un exemple. */
const NOMS_PAR_FAMILLE = 2;

export function VitrineBase({ locale }: { locale: Locale }) {
  const base = lireVitrine();
  const familles = base.familles.slice(0, FAMILLES_MONTREES);

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mt-5"
      aria-labelledby="vitrine-titre"
    >
      <EyebrowLabel color="var(--accent-purple)" className="mb-2">
        {t("vitrine.eyebrow", locale)}
      </EyebrowLabel>

      <h2 id="vitrine-titre" className="text-[15px] font-semibold text-text-heading">
        {t("vitrine.titre", locale)}
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-text-body">
        {t("vitrine.sous", locale).replace("{n}", String(base.vies))}
      </p>

      <div className="mt-4">
        <EyebrowLabel color="var(--text-body-subtle)" className="mb-2">
          {t("vitrine.familles", locale)}
        </EyebrowLabel>

        <ul className="space-y-2">
          {familles.map((f) => (
            <li
              key={f.sujet}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5"
              style={{ background: "var(--bg-secondary)" }}
            >
              {/* Les pastilles d abord : c est ce qu on regarde. */}
              <div className="flex shrink-0 -space-x-2">
                {f.noms.slice(0, NOMS_PAR_FAMILLE).map((nom) => (
                  <span
                    key={nom}
                    title={nom}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold"
                    style={{
                      background: "var(--surface-medium)",
                      color: "var(--text-body)",
                      border: "1px solid var(--bg-secondary)",
                    }}
                  >
                    {initiales(nom)}
                  </span>
                ))}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-text-heading">
                  {STRINGS_VITRINE_SUJETS(locale)[f.sujet] ?? f.sujet}
                </p>
                <p className="truncate text-[11px] text-text-body-subtle">
                  {f.noms.slice(0, NOMS_PAR_FAMILLE).join(" · ")}
                </p>
              </div>

              <span className="shrink-0 text-[11px] font-semibold tabular-nums text-text-body-subtle">
                {f.noms.length}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* La mesure qui rend le reste credible, et qu on ecrit meme si elle
          dessert : la plupart du temps, il n y a rien a dire. */}
      <p className="mt-3 text-[12px] leading-relaxed text-text-body-subtle">
        {t("vitrine.mesure", locale).replace("{p}", String(base.medianeParle).replace(".", ","))}
      </p>

      <p className="mt-3 text-[13px] font-medium leading-relaxed text-text-heading">
        {t("vitrine.puis", locale)}
      </p>
    </motion.section>
  );
}
