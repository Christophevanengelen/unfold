"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion } from "motion/react";
import { DotsHorizontal, TrashBin } from "flowbite-react-icons/outline";
import { useRouter } from "next/navigation";
import { ChevronRight } from "flowbite-react-icons/outline";
import { useLongPress } from "@/lib/use-long-press";
import type { RealConnection } from "@/lib/connections-store";
import type { ConnectionSummary } from "@/lib/connection-summary";
import { relationshipConfig } from "./relationshipConfig";
import { RelationshipAvatar } from "./RelationshipAvatar";
import { TierPulse } from "./TierPulse";
import { WindowMicroPreview } from "./WindowMicroPreview";
import { connectionHref } from "@/lib/connection-href";
import { detectLocale } from "@/lib/i18n-demo";
import { perso } from "@/lib/perso-i18n";
import { franchir, toucher } from "@/lib/haptique";

interface ConnectionRowProps {
  connection: RealConnection;
  summary: ConnectionSummary | undefined;
  loading?: boolean;
  onLongPress: () => void;
  onSupprimer?: () => void;
}

/** Largeur des deux actions revelees par le balayage. 72 pt chacune : au-dessus
 *  des 44 pt d Apple, parce qu on les vise en aveugle, le pouce encore en
 *  mouvement. */
const ACTION = 72;
const OUVERT = -ACTION * 2;

/**
 * 70px-tall list row — the "rhythm inbox" card.
 *
 * Layout:
 *   [avatar with tier ring]  [name + headline]          [pulse (if PEAK active)] [chevron]
 *
 * Ordering + sectioning is handled by ConnectionList, not here.
 */
export function ConnectionRow({ connection, summary, loading, onLongPress, onSupprimer }: ConnectionRowProps) {
  const locale = detectLocale();
  const router = useRouter();
  const rel = relationshipConfig[connection.relationship];
  const lp = useLongPress(onLongPress);
  const didLongPressRef = useRef(false);
  // Le balayage vers la gauche, comme dans Mail. L appui long reste : il sert
  // au clavier, aux lecteurs d ecran, et a ceux qui l ont appris ici.
  const x = useMotionValue(0);
  const [ouvert, setOuvert] = useState(false);
  const sansMouvement = useReducedMotion();
  const glissaitRef = useRef(false);

  const fermer = () => setOuvert(false);

  // `animate` en propriete se battait avec `drag` pour la meme valeur : a
  // chaque rendu il ramenait la carte a zero, et le balayage ne s ouvrait
  // jamais. On anime donc la valeur nous-memes, apres coup, quand l etat
  // change — le glissement garde la main pendant qu il dure.
  useEffect(() => {
    const cible = ouvert ? OUVERT : 0;
    if (sansMouvement) { x.set(cible); return; }
    const c = animate(x, cible, { type: "spring", stiffness: 520, damping: 44 });
    return () => c.stop();
  }, [ouvert, sansMouvement, x]);

  // Extract the click-suppression flag out of the spread props
  const { didLongPress, ...dom } = lp;

  const handleClick = (e: React.MouseEvent) => {
    // Un balayage qui vient de se terminer n est pas un clic, et une rangee
    // ouverte se referme au premier toucher — c est ce que fait iOS, et c est
    // ce qu on cherche a faire quand on a ouvert par erreur.
    if (glissaitRef.current) {
      glissaitRef.current = false;
      e.preventDefault();
      return;
    }
    if (ouvert) {
      e.preventDefault();
      fermer();
      return;
    }
    if (didLongPress()) {
      e.preventDefault();
      didLongPressRef.current = true;
      return;
    }
    if (!didLongPressRef.current) {
      router.push(connectionHref(connection.id));
    }
  };

  const ringColor = summary?.currentTierColor ?? "transparent";
  const pulse = summary?.status === "active" && summary?.currentTier === "PEAK";

  return (
    // Le conteneur porte un fond NEUTRE. Il portait le rouge d alerte, et comme
    // le bouton « Plus » est translucide, le rouge passait dessous : les deux
    // actions se lisaient comme destructrices. Le rouge n appartient qu a
    // « Retirer », et il s arrete a son bord.
    <div className="relative overflow-hidden rounded-2xl" style={{ background: "var(--bg-secondary)" }}>
      {/* Les actions vivent SOUS la carte et ne bougent pas : c est la carte qui
          glisse et les decouvre. Les empiler au-dessus et les faire entrer
          donnerait deux mouvements pour un seul geste. */}
      <div className="absolute inset-y-0 right-0 flex" aria-hidden={!ouvert}>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fermer(); onLongPress(); }}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold"
          style={{ width: ACTION, background: "var(--bg-tertiary)", color: "var(--text-body)" }}
          aria-label={perso("compat.plus", locale)}
          tabIndex={ouvert ? 0 : -1}
        >
          <DotsHorizontal size={18} />
          {perso("compat.plus", locale)}
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); fermer(); onSupprimer ? onSupprimer() : onLongPress(); }}
          className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold"
          style={{ width: ACTION, background: "var(--bg-alerte)", color: "var(--text-on-alerte)" }}
          aria-label={perso("compat.supprimer", locale)}
          tabIndex={ouvert ? 0 : -1}
        >
          <TrashBin size={18} />
          {perso("compat.suppr_court", locale)}
        </button>
      </div>

    <motion.div
      {...dom}
      // Le balayage reste disponible quand « Reduire les animations » est
      // actif : ce reglage demande moins de mouvement, pas moins d application.
      // Ce qui change, c est le retour du ressort — instantane plus bas.
      drag="x"
      dragDirectionLock
      dragConstraints={{ left: OUVERT, right: 0 }}
      dragElastic={{ left: 0.04, right: 0 }}
      dragMomentum={false}
      style={{ x, background: "var(--bg-secondary)", minHeight: 70 }}
      onDragStart={() => { glissaitRef.current = true; }}
      onDrag={(_, info) => {
        // Le retour dans la main arrive au seuil, pas au relachement : c est
        // lui qui dit « la, ca s ouvre » pendant que le doigt decide encore.
        if (!ouvert && info.offset.x < OUVERT / 2) { setOuvert(true); franchir(); }
        if (ouvert && info.offset.x > OUVERT / 2) { setOuvert(false); toucher(); }
      }}
      onDragEnd={(_, info) => {
        const ouvre = info.offset.x < OUVERT / 2 || info.velocity.x < -420;
        setOuvert(ouvre);
        // Le clic de fin de glissement est avale par handleClick.
        setTimeout(() => { glissaitRef.current = false; }, 60);
      }}
      onClick={handleClick}
      role="link"
      tabIndex={0}
      aria-label={`${connection.name}, ${perso(rel.cleLabel, locale)}`}
      className="group relative flex cursor-pointer touch-pan-y items-center gap-3 rounded-2xl px-4 py-3 select-none active:scale-[0.995]"
    >
      <RelationshipAvatar
        initial={connection.initial}
        relationship={connection.relationship}
        ringColor={ringColor}
        pulse={pulse}
        size={44}
      />

      {/* Deux lignes, pas une.
          Avant : le nom sur la premiere ligne, puis « RELATION · resume » sur
          la seconde, dans un flex sans largeur minimale ni troncature. Des que
          le resume depassait — et il depasse dans la plupart des langues — il
          repassait a la ligne SOUS la relation, chevauchait, et poussait le
          chevron. C est ce que Christophe a vu : des textes qui empietent.

          Maintenant la relation tient a droite du nom, ou elle ne bouge plus
          (shrink-0), et le resume occupe seul sa ligne, sur toute la largeur.
          C est l information que cette liste existe pour montrer : elle merite
          sa ligne. `min-w-0` sur les deux niveaux est ce qui autorise la
          troncature a fonctionner dans un flex. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-text-heading">
            {connection.name}
          </span>
          {pulse && <TierPulse color={summary!.currentTierColor} size={6} />}
          <span className="shrink-0 text-[10px] uppercase tracking-widest text-text-body-subtle">
            {perso(rel.cleLabel, locale)}
          </span>
        </div>
        {/* Solo vs connecte, dit sans jugement — jamais "faux" ni "incomplet".
            Une fiche solo n a ni inviteCode ni connectedSince reels (voir
            RealConnection dans lib/connections-store.ts) : ce badge est la
            seule trace visible de cette difference, discrete et non alarmante. */}
        {connection.isSolo && (
          <p className="mt-0.5 text-[10px] text-text-body-subtle">
            {perso("compat.solo_badge", locale)}
          </p>
        )}
        <div className="mt-1 min-w-0">
          <WindowMicroPreview summary={summary} loading={loading} />
        </div>
      </div>

      <ChevronRight size={16} className="shrink-0 text-text-body-subtle" />
    </motion.div>
    </div>
  );
}
