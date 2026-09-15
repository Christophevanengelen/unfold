"use client";

/**
 * Vela : un astre qui veille.
 *
 * Le dessin vient de `messages/vela-astrologue.html`, validé avec Christophe.
 * Deux décisions s'y tiennent :
 *
 *  - **Aucun visage humain.** Un disque, un anneau incliné, deux yeux, une
 *    bouche d'un seul trait. Une mascotte perdrait toute crédibilité le jour
 *    où elle annonce une mauvaise nouvelle — et elle en annoncera.
 *  - **L'anneau qui tourne n'est pas un ornement.** Il ne tourne que pendant
 *    `occupee`, quand le moteur calcule : c'est la seule animation qui dure,
 *    et elle dit quelque chose. Le reste du temps, Vela respire et cligne.
 *
 * `prefers-reduced-motion` arrête tout : le composant reste lisible, immobile.
 */

import { useId } from "react";

export function VelaAvatar({
  taille = 96,
  occupee = false,
  className,
}: {
  taille?: number;
  /** Le moteur calcule : l'anneau tourne, les yeux restent ouverts. */
  occupee?: boolean;
  className?: string;
}) {
  // Un identifiant par instance : deux avatars sur la même page ne doivent pas
  // partager leurs animations nommées.
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");

  return (
    <span className={className} style={{ display: "inline-block", lineHeight: 0 }}>
      <style>{`
        @keyframes vela-respire-${id}{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.08);opacity:.8}}
        @keyframes vela-tourne-${id}{to{transform:rotate(360deg)}}
        @keyframes vela-cligne-${id}{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.12)}}
        @keyframes vela-scintille-${id}{0%,100%{opacity:.35}50%{opacity:1}}
        .vela-${id} .halo{transform-origin:center;transform-box:fill-box;animation:vela-respire-${id} 5.5s ease-in-out infinite}
        .vela-${id} .anneau{transform-origin:center;transform-box:fill-box;animation:vela-tourne-${id} ${occupee ? "2.6s" : "26s"} linear infinite}
        .vela-${id} .oeil{transform-origin:center;transform-box:fill-box;animation:vela-cligne-${id} 7s ease-in-out infinite}
        .vela-${id} .etoile{animation:vela-scintille-${id} 3.4s ease-in-out infinite}
        .vela-${id} .etoile:nth-of-type(2){animation-delay:1.1s}
        .vela-${id} .etoile:nth-of-type(3){animation-delay:2.2s}
        @media (prefers-reduced-motion:reduce){.vela-${id} *{animation:none!important}}
      `}</style>
      <svg
        className={`vela-${id}`}
        width={taille}
        height={taille}
        viewBox="0 0 120 120"
        role="img"
        aria-label="Vela"
      >
        <circle className="halo" cx="60" cy="60" r="40" fill="var(--accent-purple)" opacity=".45" />
        <g className="anneau">
          <ellipse
            cx="60" cy="60" rx="46" ry="17"
            fill="none" stroke="var(--accent-purple)" strokeWidth="1.5" opacity=".6"
            transform="rotate(-22 60 60)"
          />
        </g>
        <circle cx="60" cy="60" r="29" fill="var(--bg-brand)" />
        <g fill="var(--text-on-brand)">
          {occupee ? (
            <>
              <ellipse cx="50" cy="57" rx="3.4" ry="3.8" />
              <ellipse cx="70" cy="57" rx="3.4" ry="3.8" />
            </>
          ) : (
            <>
              <ellipse className="oeil" cx="50" cy="57" rx="3.4" ry="3.8" />
              <ellipse className="oeil" cx="70" cy="57" rx="3.4" ry="3.8" />
            </>
          )}
          <path
            d="M52 70 q8 6 16 0"
            stroke="var(--text-on-brand)" strokeWidth="2.6" fill="none" strokeLinecap="round"
          />
        </g>
        <circle className="etoile" cx="99" cy="34" r="2.4" fill="var(--bg-premium)" />
        <circle className="etoile" cx="18" cy="46" r="1.8" fill="var(--bg-premium)" />
        <circle className="etoile" cx="90" cy="92" r="2" fill="var(--accent-purple)" />
      </svg>
    </span>
  );
}
