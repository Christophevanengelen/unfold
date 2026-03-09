"use client";

import { createContext, useContext } from "react";

export const PremiumTeaserContext = createContext<() => void>(() => {});
export function usePremiumTeaser() {
  return useContext(PremiumTeaserContext);
}
