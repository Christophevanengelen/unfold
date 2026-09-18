"use client";

/**
 * Ce qu on montre avant la premiere connexion.
 *
 * ─── L HISTORIQUE, PARCE QU IL EXPLIQUE LA FORME ────────────────────────────
 *
 * Premiere version (11/09) : ce que contient la base de personnalites.
 * Christophe l a corrigee le jour meme — cet ecran doit vendre le match ENTRE
 * DEUX PERSONNES, pas l encyclopedie qui sert a comparer.
 *
 * Deuxieme correction (17/09, matin), apres « je vois rien qui bouge » : la
 * vitrine montrait encore l ancienne fiche alors que le rapport avait ete
 * refait la veille. Quelqu un qui n avait invite personne n avait aucun moyen
 * de voir le nouveau produit.
 *
 * TROISIEME REECRITURE, le 17/09 au soir. Christophe : « pour l ecran de
 * demarrage, quand on n a pas encore un seul match, j aimerais quelque chose
 * qui vende beaucoup mieux ».
 *
 * ─── CE QU ON A SUPPRIME, ET C EST LE PLUS IMPORTANT ────────────────────────
 *
 * L ecran montrait une carte d exemple avec un score de 73/100 et deux barres.
 * Elle est partie entierement. Trois raisons, par gravite :
 *
 * 1. **Le premier chiffre que la personne voyait etait faux.** Le produit vend
 *    un resultat calcule, stable, non negociable — et son ecran d accueil
 *    apprenait que les nombres d ici sont decoratifs. On ne peut pas tenir la
 *    regle « aucune donnee inventee » partout SAUF sur la vitrine.
 *
 * 2. **Elle posait une ancre.** A 73 annonce, un vrai score de 54 se vit comme
 *    un echec, et un vrai 73 comme une confirmation. On fabriquait la
 *    deception de la premiere vraie fiche.
 *
 * 3. **Elle montrait le moins distinctif du produit.** Un score global, ce que
 *    tout le monde affiche — au lieu de la lecture a double sens, que personne
 *    d autre ne fait.
 *
 * Partis aussi : la consigne « Invitez quelqu un pour commencer » (ton
 * administratif, et elle vouvoyait quand tout le reste tutoie), les deux barres
 * de progression (une jauge dit remplissage, donc performance, donc promesse),
 * et la parite des deux boutons — presque personne n a un code en poche, les
 * deux choix ne sont pas egaux.
 *
 * ─── CE QU IL Y A A LA PLACE ────────────────────────────────────────────────
 *
 * SON empreinte a elle, la vraie, tiree de sa propre naissance. Et un disque de
 * verre qui la recouvre en partie, dans lequel LA MEME courbe se lit decalee et
 * dans une autre teinte.
 *
 * C est la demonstration litterale de la promesse : un seul trait, deux
 * valeurs, selon le cote d ou on le regarde. Et c est le seul ecran de l app ou
 * « ca se lit dans les deux sens » peut se montrer avec UNE seule naissance —
 * sans inventer un deuxieme humain, donc sans retomber dans le defaut qu on
 * vient de corriger.
 *
 * Le disque est volontairement plus petit que l empreinte : c est une place,
 * pas encore une personne. Il n est pas cliquable — un rond de cette taille
 * ressemble a un emplacement d avatar, et on taperait dedans.
 */

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { t, type Locale } from "@/lib/i18n-demo";
import { empreinteDeNaissance } from "@/lib/empreinte";
import type { BirthData } from "@/lib/birth-data";
import { Empreinte } from "./rapport/Empreinte";

/** Le cadre du diptyque, en points. */
const LARGEUR = 336;
const HAUTEUR = 268;

/** L empreinte : large, posee a gauche. */
const EMPREINTE = { taille: 268, gauche: -14, haut: 0 };

/**
 * Le verre : plus petit, et il mord franchement sur l empreinte.
 *
 * Premiere tentative posee trop a droite : la courbe ne faisait qu effleurer le
 * bord et le disque se lisait comme un grand rond gris vide. Un verre doit etre
 * TRAVERSE par ce qu il montre, sinon ce n est pas une loupe, c est une tache.
 * Son centre tombe maintenant dans la moitie dense de la figure.
 */
const VERRE = { taille: 150, gauche: 150, haut: 62 };

/**
 * L empreinte hors du verre est retenue ; dedans, elle est pleine.
 *
 * C est ce qui fait la lecture : la meme courbe, plus affirmee d un cote du
 * bord que de l autre. Sans cet ecart, les deux moities se valent et le disque
 * ne raconte rien.
 */
const DEHORS = 0.42;

/**
 * Le decalage de la seconde lecture, en points.
 *
 * Trois a droite, deux vers le haut, quatre pour cent plus grand. Assez pour
 * qu on voie DEUX traits la ou il n y en a qu un, trop peu pour qu on croie a
 * deux dessins differents. C est une refraction, pas une copie.
 */
const REFRACTION = "translate(3px, -2px) scale(1.04)";

export function VitrineBase({
  locale,
  naissance,
  onCodeRecu,
  onAjouter,
}: {
  locale: Locale;
  /** La naissance de la personne. Sans elle, pas d empreinte a montrer. */
  naissance: BirthData | null;
  /** Ouvre le vrai formulaire de saisie de code, tenu par la page. */
  onCodeRecu?: () => void;
  /**
   * Ouvre AjouterMatchSheet — meme feuille que le bouton « + » en haut de la
   * page. Christophe, le 19/09, en revoyant l ecran a zero connexion :
   * « c est toujours ce qu il y avait avant ». Il avait raison — CE geste
   * precis pointait encore en direct vers /app/invite/share, en contournant
   * completement la feuille a deux voies (code ou saisie manuelle) ajoutee
   * le 18/09. Le bouton « + » l ouvrait deja correctement ; c etait donc
   * invisible en un coup d oeil sur l ecran que tout le monde voit en
   * premier — celui-ci, avant la toute premiere connexion.
   */
  onAjouter?: () => void;
}) {
  const fige = useReducedMotion();

  // Sans date de naissance il n y a rien d honnete a dessiner. On ne retombe
  // PAS sur une empreinte d exemple : ce serait exactement la faute qu on vient
  // de corriger, en plus discret.
  const iso = naissance?.birthDate
    ? `${naissance.birthDate}T${naissance.birthTime || "00:00"}`
    : null;
  const parametres = iso ? empreinteDeNaissance(iso) : null;

  return (
    <motion.section
      // L ecran vide se centre dans la hauteur disponible. Pose en haut, il
      // laissait un tiers d ecran mort sous le dernier lien — et un vide en bas
      // se lit comme « il manque quelque chose ici », alors que le vide voulu
      // est celui DANS le disque.
      className="flex min-h-[64vh] flex-col items-center justify-center text-center"
      initial={fige ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      data-vitrine-vide="1"
    >
      {parametres ? (
        <div
          className="relative shrink-0"
          style={{ width: LARGEUR, height: HAUTEUR }}
          aria-hidden="true"
        >
          <Empreinte
            parametres={parametres}
            taille={EMPREINTE.taille}
            opacite={DEHORS}
            aura
            className="pointer-events-none absolute"
            style={{ left: EMPREINTE.gauche, top: EMPREINTE.haut }}
          />

          {/* Le verre. Pose des la premiere image, immobile : c est la courbe
              qui vient a lui, pas l inverse. */}
          <div
            data-vitrine-verre="1"
            className="pointer-events-none absolute rounded-full"
            style={{
              left: VERRE.gauche,
              top: VERRE.haut,
              width: VERRE.taille,
              height: VERRE.taille,
              background: "var(--glass-pill)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "inset 0 0 0 1px var(--border-tint-light)",
            }}
          />

          {/* La meme courbe, vue a travers le verre : decalee, et d une autre
              teinte. Decoupee au cercle, et posee PAR-DESSUS le flou — sinon
              elle serait floutee avec le fond et on ne verrait rien. */}
          <div
            className="pointer-events-none absolute overflow-hidden rounded-full"
            style={{
              left: VERRE.gauche,
              top: VERRE.haut,
              width: VERRE.taille,
              height: VERRE.taille,
            }}
          >
            <Empreinte
              parametres={parametres}
              taille={EMPREINTE.taille}
              teinte="var(--text-body-subtle)"
              className="absolute"
              style={{
                left: EMPREINTE.gauche - VERRE.gauche,
                top: EMPREINTE.haut - VERRE.haut,
                transform: REFRACTION,
              }}
            />
          </div>
        </div>
      ) : null}

      <h2
        className="mt-1 max-w-[13ch] text-[32px] leading-[1.1]"
        style={{
          fontFamily: "var(--font-titre)",
          fontWeight: 300,
          letterSpacing: "-0.015em",
          color: "var(--text-heading)",
          textWrap: "balance",
        }}
      >
        {t("vitrine.titre_vide", locale)}
      </h2>

      <p className="mt-3 max-w-[32ch] text-[14px] leading-relaxed text-text-body-subtle">
        {t("vitrine.sous_vide", locale)}
      </p>

      {/* Un seul geste mis en avant. « J ai recu un code » est l etat d une
          minorite : il redescend au rang de lien.

          Un bouton qui ouvre AjouterMatchSheet, pas un lien direct vers
          /app/invite/share : voir le commentaire sur `onAjouter` ci-dessus. */}
      <button
        type="button"
        onClick={onAjouter}
        className="mt-7 flex h-[52px] w-full max-w-[320px] items-center justify-center rounded-full text-[16px] font-semibold"
        style={{ background: "var(--bg-brand)", color: "var(--text-on-brand)" }}
      >
        {t("vitrine.inviter", locale)}
      </button>

      {/* CORRIGE LE 17/09 AU SOIR. Ce lien pointait vers `/app/invite/join`,
          qui n attend que des parametres d URL et redirige silencieusement
          des qu ils manquent — donc rien ne se passait au clic. C est le
          signalement de Christophe : « je ne peux pas encoder le code ».

          Un bouton qui ouvre le formulaire existant, plutot qu un lien vers
          une page qui n en porte pas. */}
      <button
        type="button"
        onClick={onCodeRecu}
        className="mt-4 text-[15px] font-medium underline underline-offset-4"
        style={{ color: "var(--text-body-subtle)", textDecorationColor: "var(--border-base)" }}
      >
        {t("vitrine.recu", locale)}
      </button>
    </motion.section>
  );
}
