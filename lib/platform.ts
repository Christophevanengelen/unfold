"use client";

import { useSyncExternalStore } from "react";

/**
 * Single source of truth for runtime platform detection.
 *
 * RULE: this is the ONLY file allowed to read `window.Capacitor`,
 * `process.env.NEXT_PUBLIC_NATIVE`, or any platform-specific globals.
 * Every other file should import from here. This keeps platform
 * conditionals out of UI components and enforces visual parity between
 * web `/demo` and the Capacitor-wrapped native app.
 *
 * If you find yourself writing `if (Capacitor.getPlatform() === ...)`
 * inside `components/demo/**`, you're doing it wrong. Push the conditional
 * up to the layout layer (chrome on/off) or extract a copy table here.
 */

export type Platform = "web" | "ios" | "android";

declare global {
  interface Window {
    Capacitor?: {
      getPlatform?: () => Platform | string;
      isNativePlatform?: () => boolean;
    };
  }
}

/** Sync, SSR-safe platform read. Returns "web" on server. */
export function getPlatform(): Platform {
  if (typeof window === "undefined") return "web";
  const cap = window.Capacitor;
  if (cap?.getPlatform) {
    const p = cap.getPlatform();
    if (p === "ios" || p === "android") return p;
  }
  // Build-time NEXT_PUBLIC_NATIVE flag for static-export native bundle
  if (process.env.NEXT_PUBLIC_NATIVE === "true") return "ios";
  return "web";
}

/** True when running inside the Capacitor native shell (iOS or Android). */
export function isNative(): boolean {
  if (typeof window === "undefined") return false;
  return window.Capacitor?.isNativePlatform?.() === true ||
    process.env.NEXT_PUBLIC_NATIVE === "true";
}

/**
 * La plateforme vit HORS de React : `window.Capacitor` est injecte par la
 * coque avant que le paquet ne se charge, et NEXT_PUBLIC_NATIVE est remplacee
 * a la compilation. C est exactement le cas que useSyncExternalStore couvre,
 * et c est le motif du depot — voir lib/use-locale.ts.
 *
 * POURQUOI ON A CHANGE : le hook demarrait a `false` et un effet le corrigeait
 * apres le montage. Le premier ecran etait donc rendu « en mode web » — cadre
 * de telephone, fausses zones de securite — avant de basculer, a chaque
 * demarrage de l app. React 19 le signale a juste titre.
 *
 * La lecture SERVEUR renvoie la constante de compilation et non `false` :
 * elle vaut la meme chose cote serveur et cote client dans un meme paquet,
 * donc le paquet natif rend juste des la premiere image et l hydratation reste
 * coherente. Meme approche que le hook local de app/app/layout.tsx.
 */
function abonnerPlateforme(): () => void {
  // Rien ne fait apparaitre ni disparaitre la coque en cours de session : il n y
  // a aucun evenement a ecouter, seulement la fonction de desabonnement exigee.
  return () => {};
}

function lirePlateformeServeur(): boolean {
  return process.env.NEXT_PUBLIC_NATIVE === "true";
}

/**
 * React hook — observational only.
 *
 * **NEVER** branch UI styling on this. Use it for:
 *  - Phone frame on/off in app/demo/layout.tsx
 *  - Safe-area source (env() vs hardcoded SAFE_TOP)
 *  - Routing iOS away from Stripe Checkout (anti-steering)
 *
 * **NEVER** use it for:
 *  - Different colors / fonts / animations between web and native
 *  - Conditional rendering of feature UI (use feature flags instead)
 */
export function useIsNative(): boolean {
  return useSyncExternalStore(abonnerPlateforme, isNative, lirePlateformeServeur);
}

/**
 * Anti-steering guard — true if the bundle is iOS (Apple App Store).
 * Use this to hide ALL price text, payment links, and billing CTAs.
 * This is the only platform-specific copy decision allowed in components/demo/**.
 */
export function isIOSBundle(): boolean {
  return getPlatform() === "ios";
}
