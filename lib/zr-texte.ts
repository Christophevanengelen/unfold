/**
 * Le texte d un pic ZR, actif et propre au lot — pas une formule mecanique.
 *
 * Doctrine (Valens / Demetra George / Chris Brennan, transmise par
 * Marie-Ange le 19/09/2026, voir docs/zr-doctrine.md) : un pic n est jamais
 * "les bonnes annees" — c est de l energeia, une importance et une activite
 * accrues. Ce qui varie selon le lot, ce n est pas la geometrie du pic (les
 * memes 4 signes, angulaires a la Lot de Fortune) mais son SUJET :
 *   — spirit : ce qu on poursuit intentionnellement — carriere, visibilite,
 *     occasions a saisir (Valens : la fenetre classique d eminence) ;
 *   — eros   : le desir, la mise en couple, les rencontres qui comptent ;
 *   — fortune: ce qui ARRIVE au corps, a l argent, au cadre de vie — on ne
 *     l initie pas, on y fait face.
 *
 * Chaque lot a PLUSIEURS variantes, choisies de façon deterministe (jamais
 * Math.random — meme regle que le reste de la branche : la meme vie doit
 * toujours rendre la meme image). Le ton est actif : nommer un geste
 * concret (envoyer un CV, proposer un rendez-vous, s occuper d un dossier)
 * plutot que decrire une date sans rien en faire.
 *
 * On ne mentionne jamais de personnalite reelle ici — les exemples celebres
 * de la doctrine (Jackie Kennedy, George Lucas, Kurt Cobain...) ont servi a
 * calibrer le TON, jamais a apparaitre dans l app : comparer une personne a
 * une celebrite a chaque pic serait deplace, pas seulement hors-charte.
 */

import type { LotZR } from "@/lib/zr-pics";

type LangueTexte = "fr" | "en";

function langueDe(locale: string): LangueTexte {
  return locale === "fr" ? "fr" : "en";
}

/** Meme famille de hachage que `bruit()` dans BrancheDeVie.tsx, seed separee. */
function indexDeterministe(graine: number, n: number): number {
  const x = Math.imul(graine ^ (graine >>> 15), 0x2c1b3c6d) ^ graine;
  const y = Math.imul(x ^ (x >>> 12), 0x297a2d39);
  const v = ((y ^ (y >>> 15)) >>> 0) / 4294967296;
  return Math.min(n - 1, Math.floor(v * n));
}

/**
 * Pic acheve ou en cours avec une duree connue : {a} ouverture, {b} fin,
 * {n} duree, {sujet} le nom du lot (deja adapte a l age — voir sujetClefDe
 * dans BrancheDeVie.tsx).
 */
const VARIANTES_PIC: Record<LangueTexte, Record<LotZR, string[]>> = {
  fr: {
    spirit: [
      "{sujet} est en pleine lumière : de {a} à {b} ({n}). Envoie ce CV, propose ton projet, montre ce que tu sais faire — ça se remarque plus que d'habitude.",
      "De {a} à {b} ({n}), {sujet} s'accélère. Les portes qui s'entrouvrent maintenant valent la peine d'être poussées.",
      "{sujet} devient visible : de {a} à {b} ({n}). Parle de ce que tu fais, va vers les gens qui comptent dans ce domaine.",
      "De {a} à {b} ({n}), ce que tu entreprends a plus de portée. C'est le moment de te lancer, pas d'attendre le bon moment.",
      "{sujet} prend le devant de la scène : de {a} à {b} ({n}). Une occasion saisie maintenant peut changer la suite.",
    ],
    eros: [
      "L'amour est au centre : de {a} à {b} ({n}). Accepte le rendez-vous, organise le dîner, fais le premier pas.",
      "De {a} à {b} ({n}), les rencontres pèsent plus lourd que d'habitude. Une histoire peut commencer, ou passer à autre chose de plus sérieux.",
      "{sujet} s'intensifie : de {a} à {b} ({n}). C'est le moment de rendre les choses visibles — se montrer, se déclarer, avancer.",
      "De {a} à {b} ({n}), le désir mène. Dis oui à l'invitation, propose la sortie, laisse de la place au lien qui se crée.",
      "{sujet} devient l'histoire principale : de {a} à {b} ({n}). Ce qui se noue maintenant compte plus qu'à l'ordinaire.",
    ],
    fortune: [
      "{sujet} bouge : de {a} à {b} ({n}). Un bilan santé, un changement de logement, une question d'argent — profites-en pour t'en occuper vraiment.",
      "De {a} à {b} ({n}), ton corps et ton quotidien demandent plus d'attention. Écoute les signaux, prends soin de ce qui te porte.",
      "{sujet} pèse plus lourd : de {a} à {b} ({n}). Ce qui t'arrive compte double — un imprévu, une opportunité matérielle, un changement de décor.",
      "De {a} à {b} ({n}), c'est le bon moment pour régler ce qui traîne : un rendez-vous médical, un dossier, une réparation.",
      "{sujet} s'active : de {a} à {b} ({n}). La vie matérielle demande une vraie présence — corps, argent, environnement.",
    ],
  },
  en: {
    spirit: [
      "{sujet} takes the spotlight: from {a} to {b} ({n}). Send that CV, pitch your project, show what you can do — it lands harder than usual right now.",
      "From {a} to {b} ({n}), {sujet} speeds up. Doors that crack open now are worth pushing.",
      "{sujet} becomes visible: from {a} to {b} ({n}). Talk about what you do, reach out to the people who matter in this field.",
      "From {a} to {b} ({n}), what you start now carries further. This is the moment to act, not wait for a better one.",
      "{sujet} steps into the spotlight: from {a} to {b} ({n}). An opportunity taken now can change what comes next.",
    ],
    eros: [
      "Love takes center stage: from {a} to {b} ({n}). Say yes to the date, plan the dinner, make the first move.",
      "From {a} to {b} ({n}), meeting people matters more than usual. A story can start, or turn into something real.",
      "{sujet} intensifies: from {a} to {b} ({n}). This is the moment to make things visible — to be seen, to declare, to move forward.",
      "From {a} to {b} ({n}), desire leads. Say yes to the invitation, suggest the plan, make room for what's forming.",
      "{sujet} becomes the main story: from {a} to {b} ({n}). What ties itself together now matters more than usual.",
    ],
    fortune: [
      "{sujet} is on the move: from {a} to {b} ({n}). A health check, a move, a money matter — use this window to really deal with it.",
      "From {a} to {b} ({n}), your body and daily life ask for more attention. Listen to the signals, take care of what carries you.",
      "{sujet} weighs more: from {a} to {b} ({n}). What happens to you counts double — an unexpected event, a material opportunity, a change of scenery.",
      "From {a} to {b} ({n}), it's a good time to handle what's been waiting: a medical appointment, paperwork, a repair.",
      "{sujet} is active: from {a} to {b} ({n}). Material life asks for real presence — body, money, surroundings.",
    ],
  },
};

/** Pic encore ouvert, sans date de fin connue : {a} ouverture, {sujet} le lot. */
const VARIANTES_PIC_ENCORE: Record<LangueTexte, Record<LotZR, string[]>> = {
  fr: {
    spirit: [
      "{sujet} est en pleine lumière depuis {a}, et ça continue. Les occasions qui se présentent maintenant valent la peine d'être saisies.",
      "Depuis {a}, {sujet} prend toute la place — et ce n'est pas fini. C'est le moment d'oser, pas d'attendre.",
    ],
    eros: [
      "L'amour est au centre depuis {a}, et l'histoire continue. Reste disponible à ce qui se passe.",
      "Depuis {a}, {sujet} s'intensifie encore. Laisse la place à ce qui se noue.",
    ],
    fortune: [
      "{sujet} bouge depuis {a}, et ça continue. Reste attentif à ton corps et à ce qui t'arrive.",
      "Depuis {a}, {sujet} demande encore de la présence — santé, argent, environnement.",
    ],
  },
  en: {
    spirit: [
      "{sujet} has been in the spotlight since {a}, and it's still going. Opportunities showing up now are worth taking.",
      "Since {a}, {sujet} has taken over — and it's not done yet. This is the moment to act, not wait.",
    ],
    eros: [
      "Love has been center stage since {a}, and the story continues. Stay open to what's happening.",
      "Since {a}, {sujet} keeps intensifying. Make room for what's forming.",
    ],
    fortune: [
      "{sujet} has been on the move since {a}, and it's still going. Stay attentive to your body and what comes your way.",
      "Since {a}, {sujet} still asks for presence — health, money, surroundings.",
    ],
  },
};

/** Un pic acheve : choisit une des variantes actives du lot, deterministe par graine. */
export function texteDuPic(lot: LotZR, locale: string, graine: number): string {
  const liste = VARIANTES_PIC[langueDe(locale)][lot];
  return liste[indexDeterministe(graine, liste.length)];
}

/** Un pic encore ouvert : meme principe, pool plus court (pas de {b}/{n} a varier autour). */
export function texteDuPicEncore(lot: LotZR, locale: string, graine: number): string {
  const liste = VARIANTES_PIC_ENCORE[langueDe(locale)][lot];
  return liste[indexDeterministe(graine, liste.length)];
}
