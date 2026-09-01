"use client";

/**
 * Le centre de messages — point d entree et feuille.
 *
 * Ce que ce fichier remplace : deux cartes montees en
 * `absolute inset-0 z-30 flex items-center justify-center` par-dessus la
 * timeline, chacune avec sa croix, toutes deux affichees en meme temps.
 *
 * Les trois regles sont dans lib/messages.ts. Ce qu elles donnent ici :
 *
 *   — Le point d entree est une PASTILLE de 44 points dans la bande du haut.
 *     Elle ne recouvre rien ; elle vit dans l espace deja reserve par le
 *     `pt-9` des deux vues.
 *   — Un point de non-lu, pas un compteur. Un nombre sur une boite aux lettres
 *     est une dette a solder ; un point dit seulement « il y a quelque chose ».
 *   — La feuille est la primitive BottomSheet du produit, celle du reste de
 *     l app. Ouvrir marque tout comme lu : la personne a vu, ca suffit.
 *
 * MATIERE : les jetons de verre, comme les autres controles flottants. Pas
 * d ombre ajoutee, pas de cerne renforce. Voir la skill favorable-design.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BottomSheet } from "./primitives/BottomSheet";
import { useMessages, useNonLus, marquerToutLu, type Message } from "@/lib/messages";
import { useLocale } from "@/lib/use-locale";
import { perso } from "@/lib/perso-i18n";
import { S } from "@/lib/layout-constants";
import type { Locale } from "@/lib/i18n-demo";

// ─── Le bandeau de chaque message ────────────────────────────────────────────

function bandeau(type: Message["type"], locale: Locale): string {
  if (type === "briefing_jour") return perso("messages.jour", locale);
  if (type === "briefing_periode") return perso("messages.periode", locale);
  return perso("messages.notif", locale);
}

/**
 * « Aujourd hui », « Hier », ou la date.
 *
 * Comparaison sur l ANNEE, LE MOIS ET LE JOUR locaux, pas sur un ecart de
 * millisecondes : « il y a moins de 24 h » range a tort le message d hier
 * 23 h dans aujourd hui.
 */
function quand(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const memeJour = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const maintenant = new Date();
  if (memeJour(d, maintenant)) return perso("messages.jour", locale);

  const hier = new Date(maintenant);
  hier.setDate(hier.getDate() - 1);
  if (memeJour(d, hier)) return perso("messages.hier", locale);

  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(d);
  } catch {
    return "";
  }
}

// ─── La pastille d ouverture ─────────────────────────────────────────────────

export function PastilleMessages({ onOuvrir }: { onOuvrir: () => void }) {
  const locale = useLocale();
  const nonLus = useNonLus();

  return (
    <button
      type="button"
      onClick={onOuvrir}
      aria-label={perso("messages.ouvrir", locale)}
      className="relative flex h-11 w-11 items-center justify-center rounded-full"
      style={{
        // Pas de lisere. La pastille flotte au-dessus de la timeline et c est
        // sa MATIERE qui la detache : --glass-pill-strong est le meme verre
        // teinte, d un cran plus dense et plus opaque que --glass-pill. Le
        // contour redisait ce que la matiere disait deja.
        background: "var(--glass-pill-strong)",
        color: "var(--text-brand)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      {/* Une cloche, pas une enveloppe.
          Une enveloppe promet une correspondance : un expediteur, une reponse
          possible. Ce qui arrive ici est un signal du produit, sans emetteur et
          sans reponse attendue. C est ce que dit une cloche. */}
      <svg width="17" height="17" viewBox="0 0 17 17" fill="none" aria-hidden="true">
        <path
          d="M4 7a4.5 4.5 0 0 1 9 0c0 2.6.55 3.85 1.05 4.5H2.95C3.45 10.85 4 9.6 4 7Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <path
          d="M7 13.6a1.75 1.75 0 0 0 3 0"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>

      {/* Un POINT, pas un compteur. « 7 messages non lus » se lit comme une
          corvee a solder ; un point dit qu il y a quelque chose, sans dette. */}
      {nonLus > 0 && (
        <span
          aria-hidden="true"
          className="absolute rounded-full"
          style={{
            top: 9,
            right: 9,
            width: 7,
            height: 7,
            background: "var(--bg-brand)",
            // Ce n est pas un contour mais le FOND de la pastille remis autour
            // du point, pour qu il ne touche pas l enveloppe derriere lui.
            // Un vide de 1,5 px, de la couleur du parent : exactement la
            // separation par le fond, ecrite en border faute d autre moyen.
            border: "1.5px solid var(--glass-pill-strong)",
          }}
        />
      )}
    </button>
  );
}

// ─── Une ligne de la liste ───────────────────────────────────────────────────

function LigneMessage({ message, locale }: { message: Message; locale: Locale }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      style={{ paddingBlock: S.md }}
    >
      <div className="flex items-baseline" style={{ gap: S.sm, marginBottom: S.sm }}>
        <span
          className="font-semibold uppercase"
          style={{
            fontSize: 10,
            letterSpacing: "0.12em",
            color: "var(--text-brand)",
          }}
        >
          {bandeau(message.type, locale)}
        </span>
        <span className="flex-1" />
        <span style={{ fontSize: 10, color: "var(--text-body-subtle)" }}>
          {quand(message.date, locale)}
        </span>
      </div>

      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-body)" }}>{message.corps}</p>

      {message.action && (
        <p
          className="font-medium"
          style={{ fontSize: 12, lineHeight: 1.5, color: "var(--text-brand)", marginTop: S.sm }}
        >
          {message.action}
        </p>
      )}
    </motion.article>
  );
}

// ─── La feuille ──────────────────────────────────────────────────────────────

export function FeuilleMessages({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const locale = useLocale();
  const messages = useMessages();

  return (
    <BottomSheet open={ouvert} onClose={onFermer}>
      <div style={{ padding: `0 ${S.px}px ${S.px}px` }}>
        <h2
          className="font-semibold"
          style={{ fontSize: 16, color: "var(--text-heading)", marginBottom: S.sm }}
        >
          {perso("messages.titre", locale)}
        </h2>

        {messages.length === 0 ? (
          <div style={{ paddingBlock: S.px }}>
            <p style={{ fontSize: 14, color: "var(--text-body)" }}>
              {perso("messages.vide", locale)}
            </p>
            <p style={{ fontSize: 12, color: "var(--text-body-subtle)", marginTop: S.sm }}>
              {perso("messages.vide_sous", locale)}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((m) => (
              // Plus de filet entre les messages. Deux paddingBlock de 16 px
              // qui se suivent font deja 32 px de vide entre deux lignes —
              // une rupture de section franche. Le trait de --border-light
              // n ajoutait rien qu il fallait regarder.
              <div key={m.id}>
                <LigneMessage message={m} locale={locale} />
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </BottomSheet>
  );
}

// ─── Les deux ensemble ───────────────────────────────────────────────────────

/**
 * Le tout, pret a monter — pour un ecran ou la pastille n est PAS dans un
 * conteneur positionne.
 *
 * ATTENTION : BottomSheet se positionne en `absolute inset-x-0 bottom-0`, donc
 * relativement a son plus proche ancetre positionne. Si la pastille vit dans
 * une boite `absolute` — un coin d ecran, par exemple — la feuille s ancre DANS
 * cette boite et sort decoupee. C est ce qui s est produit sur la timeline le
 * 01/09 : une feuille large de 44 px collee en haut a droite.
 *
 * Dans ce cas, monter `PastilleMessages` et `FeuilleMessages` separement, la
 * feuille au niveau du panneau. Voir MomentumTimelineV2.
 */
export function CentreMessages() {
  const [ouvert, setOuvert] = useState(false);

  return (
    <>
      <PastilleMessages
        onOuvrir={() => {
          setOuvert(true);
          marquerToutLu();
        }}
      />
      <FeuilleMessages ouvert={ouvert} onFermer={() => setOuvert(false)} />
    </>
  );
}
