"use client";

import { useEffect, useState } from "react";

export function useAstrolearnSubjectReload(): number {
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    function handleSubjectChanged() {
      setReloadKey((value) => value + 1);
    }

    window.addEventListener("astrolearn:subject-changed", handleSubjectChanged);
    return () => window.removeEventListener("astrolearn:subject-changed", handleSubjectChanged);
  }, []);

  return reloadKey;
}
